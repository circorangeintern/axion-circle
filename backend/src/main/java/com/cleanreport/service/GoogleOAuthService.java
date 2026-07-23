package com.cleanreport.service;

import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserLevel;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.UserRepository;
import com.cleanreport.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Google OAuth2 — supports BOTH flows:
 * 1. ID Token flow: frontend sends idToken (from Credential/One-Tap)
 * 2. Authorization Code flow: frontend sends code (from Custom Button / GIS library)
 *
 * The endpoint accepts either {idToken} or {code} in the request body.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";
    private static final String GOOGLE_TOKEN_EXCHANGE_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth.google.client-secret:}")
    private String googleClientSecret;

    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * Authenticate with Google using either idToken or authorization code.
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(String idToken, String code) {
        Map<String, Object> googleUser;

        if (code != null && !code.isBlank()) {
            // Authorization Code flow (new GIS custom button)
            googleUser = exchangeCodeForUserInfo(code);
        } else if (idToken != null && !idToken.isBlank()) {
            // ID Token flow (legacy / One-Tap)
            googleUser = verifyGoogleToken(idToken);
        } else {
            throw new UnauthorizedException("Either idToken or code is required");
        }

        String email = (String) googleUser.get("email");
        String name = (String) googleUser.get("name");
        String avatarUrl = (String) googleUser.get("picture");
        String googleId = (String) googleUser.get("sub");

        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Google token does not contain email");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> createGoogleUser(email, name, avatarUrl, googleId));

        if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }

        log.info("Google OAuth login: {} ({})", user.getEmail(), user.getId());
        return buildAuthResponse(user);
    }

    // Legacy method for backward compatibility
    @Transactional
    public AuthResponse authenticateWithGoogle(String idToken) {
        return authenticateWithGoogle(idToken, null);
    }

    /**
     * Authorization Code flow: exchange code for access token, then get user info.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeCodeForUserInfo(String code) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Step 1: Exchange code for access token
            Map<String, String> tokenRequest = Map.of(
                    "code", code,
                    "client_id", googleClientId != null ? googleClientId : "",
                    "client_secret", googleClientSecret != null ? googleClientSecret : "",
                    "redirect_uri", "postmessage",
                    "grant_type", "authorization_code"
            );

            Map<String, Object> tokenResponse = restTemplate.postForObject(
                    GOOGLE_TOKEN_EXCHANGE_URL, tokenRequest, Map.class);

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new UnauthorizedException("Failed to exchange Google authorization code");
            }

            String accessToken = (String) tokenResponse.get("access_token");

            // Step 2: Get user info with access token
            RestTemplate userInfoClient = new RestTemplate();
            Map<String, Object> userInfo = userInfoClient.getForObject(
                    GOOGLE_USERINFO_URL + "?access_token=" + accessToken, Map.class);

            if (userInfo == null || !userInfo.containsKey("email")) {
                throw new UnauthorizedException("Failed to get user info from Google");
            }

            return userInfo;
        } catch (RestClientException e) {
            log.warn("Google code exchange failed: {}", e.getMessage());
            throw new UnauthorizedException("Failed to verify Google authorization code");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyGoogleToken(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.getForObject(
                    GOOGLE_TOKEN_INFO_URL + idToken, Map.class);

            if (response == null || !response.containsKey("email")) {
                throw new UnauthorizedException("Invalid Google token");
            }

            if (googleClientId != null && !googleClientId.isBlank()) {
                String aud = (String) response.get("aud");
                if (!googleClientId.equals(aud)) {
                    throw new UnauthorizedException("Google token audience mismatch");
                }
            }

            String emailVerified = String.valueOf(response.get("email_verified"));
            if (!"true".equals(emailVerified)) {
                throw new UnauthorizedException("Google email not verified");
            }

            return response;
        } catch (RestClientException e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("Failed to verify Google token");
        }
    }

    private User createGoogleUser(String email, String name, String avatarUrl, String googleId) {
        User user = User.builder()
                .email(email.toLowerCase().trim())
                .passwordHash("OAUTH_GOOGLE_" + googleId)
                .displayName(name != null ? name : email.split("@")[0])
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .lifetimeCredits(0)
                .streakCount(0)
                .level(UserLevel.OBSERVER)
                .isAnonymous(false)
                .emailVerified(true)
                .avatarUrl(avatarUrl)
                .build();

        User saved = userRepository.saveAndFlush(user);
        log.info("New Google OAuth user created: {} ({})", saved.getEmail(), saved.getId());
        return saved;
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .creditBalance(user.getCreditBalance())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();
    }
}
