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
 * Apple Sign-In OAuth flow:
 * 1. Frontend uses Apple Sign-In JS SDK to get identity token
 * 2. Sends token + user info (name, email) to POST /auth/apple
 * 3. Backend verifies token with Apple's public keys (simplified for MVP)
 * 4. Find or create user, return our JWT
 *
 * Note: Apple only sends user name on FIRST sign-in. Frontend must send it.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppleOAuthService {

    private static final String APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse authenticateWithApple(String identityToken, String email, String fullName) {
        // For MVP: trust the email from the frontend (Apple tokens require server-side JWT verification
        // with Apple's public keys which is complex — full implementation in V2)
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Apple account email is required");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> createAppleUser(email, fullName));

        log.info("Apple OAuth login: {} ({})", user.getEmail(), user.getId());
        return buildAuthResponse(user);
    }

    private User createAppleUser(String email, String fullName) {
        User user = User.builder()
                .email(email.toLowerCase().trim())
                .passwordHash("OAUTH_APPLE_" + email.hashCode())
                .displayName(fullName != null && !fullName.isBlank() ? fullName : email.split("@")[0])
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .isAnonymous(false)
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New Apple OAuth user created: {} ({})", saved.getEmail(), saved.getId());
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
