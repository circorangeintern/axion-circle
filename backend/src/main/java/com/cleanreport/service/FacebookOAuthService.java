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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Facebook OAuth login flow:
 * 1. Frontend uses Facebook Login SDK to get an access token
 * 2. Sends token to POST /auth/facebook
 * 3. Backend verifies with Facebook Graph API (/me?fields=id,name,email,picture)
 * 4. Find or create user, return our JWT
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FacebookOAuthService {

    private static final String FACEBOOK_GRAPH_URL = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=";

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse authenticateWithFacebook(String accessToken) {
        Map<String, Object> fbUser = verifyFacebookToken(accessToken);

        String email = (String) fbUser.get("email");
        String name = (String) fbUser.get("name");
        String fbId = (String) fbUser.get("id");

        // Facebook sometimes doesn't return email (privacy settings)
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Facebook account does not have a public email. Please use email registration instead.");
        }

        // Extract avatar URL from nested picture object
        String avatarUrl = extractAvatarUrl(fbUser);

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> createFacebookUser(email, name, avatarUrl, fbId));

        // Update avatar if changed
        if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }

        log.info("Facebook OAuth login: {} ({})", user.getEmail(), user.getId());
        return buildAuthResponse(user);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyFacebookToken(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.getForObject(
                    FACEBOOK_GRAPH_URL + accessToken, Map.class);

            if (response == null || !response.containsKey("id")) {
                throw new UnauthorizedException("Invalid Facebook token");
            }

            return response;
        } catch (RestClientException e) {
            log.warn("Facebook token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("Failed to verify Facebook token");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractAvatarUrl(Map<String, Object> fbUser) {
        try {
            Map<String, Object> picture = (Map<String, Object>) fbUser.get("picture");
            if (picture != null) {
                Map<String, Object> data = (Map<String, Object>) picture.get("data");
                if (data != null) {
                    return (String) data.get("url");
                }
            }
        } catch (ClassCastException e) {
            log.warn("Could not extract Facebook avatar URL");
        }
        return null;
    }

    private User createFacebookUser(String email, String name, String avatarUrl, String fbId) {
        User user = User.builder()
                .email(email.toLowerCase().trim())
                .passwordHash("OAUTH_FACEBOOK_" + fbId)
                .displayName(name != null ? name : email.split("@")[0])
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .isAnonymous(false)
                .emailVerified(true) // Facebook emails are pre-verified
                .avatarUrl(avatarUrl)
                .build();

        User saved = userRepository.save(user);
        log.info("New Facebook OAuth user created: {} ({})", saved.getEmail(), saved.getId());
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
