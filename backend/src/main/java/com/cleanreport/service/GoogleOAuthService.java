package com.cleanreport.service;

import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
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
 * Handles Google OAuth2 login flow.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String idToken) {
        Map<String, Object> googleUser = verifyGoogleToken(idToken);

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

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyGoogleToken(String idToken) {
        try {
            Map<String, Object> response = getRestTemplate().getForObject(
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
                .isAnonymous(false)
                .avatarUrl(avatarUrl)
                .build();

        User saved = userRepository.save(user);
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
