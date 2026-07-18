package com.cleanreport.service;

import com.cleanreport.dto.request.ForgotPasswordRequest;
import com.cleanreport.dto.request.ResetPasswordRequest;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Password reset flow:
 * 1. POST /auth/forgot-password — generates token, sends email (or logs for dev)
 * 2. User clicks email link with token
 * 3. POST /auth/reset-password — validates token, sets new password
 *
 * Token expires after 15 minutes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int TOKEN_EXPIRY_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Generate a reset token and "send" email.
     * Always returns success (even if email doesn't exist) to prevent email enumeration.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            Instant expires = Instant.now().plus(TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES);

            user.setPasswordResetToken(token);
            user.setPasswordResetExpires(expires);
            userRepository.save(user);

            // TODO: Integrate with Resend/SendGrid for real email sending
            // For now, log the token (visible in Render logs for testing)
            log.info("Password reset requested for {}. Token: {} (expires: {})", email, token, expires);
        });

        // Always log success — don't reveal if email exists
        log.info("Password reset flow completed for: {}", email);
    }

    /**
     * Validate token and set new password.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired reset token"));

        if (user.getPasswordResetExpires() == null || Instant.now().isAfter(user.getPasswordResetExpires())) {
            // Clear expired token
            user.setPasswordResetToken(null);
            user.setPasswordResetExpires(null);
            userRepository.save(user);
            throw new UnauthorizedException("Reset token has expired. Please request a new one.");
        }

        // Set new password and clear token
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        userRepository.save(user);

        log.info("Password reset successful for: {}", user.getEmail());
    }
}
