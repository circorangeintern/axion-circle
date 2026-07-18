package com.cleanreport.service;

import com.cleanreport.dto.request.LoginRequest;
import com.cleanreport.dto.request.RefreshTokenRequest;
import com.cleanreport.dto.request.RegisterRequest;
import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.exception.ConflictException;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.UserRepository;
import com.cleanreport.security.JwtService;
import com.cleanreport.util.DisposableEmailValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Block disposable/temp email providers
        if (DisposableEmailValidator.isDisposable(email)) {
            throw new IllegalArgumentException("Disposable email addresses are not allowed. Please use a permanent email.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered: " + email);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName().trim())
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .isAnonymous(false)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered: {} ({})", savedUser.getEmail(), savedUser.getId());

        // Send verification code
        emailVerificationService.sendVerificationCode(savedUser);

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Failed login attempt for: {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        boolean rememberMe = request.getRememberMe() != null && request.getRememberMe();
        return buildAuthResponse(user, rememberMe);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtService.isTokenValid(token) || jwtService.isTokenExpired(token)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String email = jwtService.extractEmail(token);
        UUID userId = jwtService.extractUserId(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        log.info("Token refreshed for: {}", email);
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return buildAuthResponse(user, false);
    }

    private AuthResponse buildAuthResponse(User user, boolean rememberMe) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail(), rememberMe);

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
