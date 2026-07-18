package com.cleanreport.service;

import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Email verification via 6-digit OTP code.
 * Flow:
 * 1. On registration, a 6-digit code is generated and "sent" (logged for now)
 * 2. User enters the code on the verification screen
 * 3. POST /auth/verify-email validates code and marks email as verified
 * Code expires after 10 minutes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;

    /**
     * Generate and "send" a verification code for a user.
     */
    @Transactional
    public void sendVerificationCode(User user) {
        String code = generateCode();
        Instant expires = Instant.now().plus(CODE_EXPIRY_MINUTES, ChronoUnit.MINUTES);

        user.setVerificationCode(code);
        user.setVerificationCodeExpires(expires);
        userRepository.save(user);

        // TODO: Send via Resend/SendGrid in production
        log.info("Verification code for {}: {} (expires: {})", user.getEmail(), code, expires);
    }

    /**
     * Resend verification code (generates new one).
     */
    @Transactional
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        sendVerificationCode(user);
    }

    /**
     * Verify the code entered by user.
     */
    @Transactional
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (user.getEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        if (user.getVerificationCode() == null) {
            throw new UnauthorizedException("No verification code was sent. Request a new one.");
        }

        if (user.getVerificationCodeExpires() != null && Instant.now().isAfter(user.getVerificationCodeExpires())) {
            user.setVerificationCode(null);
            user.setVerificationCodeExpires(null);
            userRepository.save(user);
            throw new UnauthorizedException("Verification code has expired. Request a new one.");
        }

        if (!code.equals(user.getVerificationCode())) {
            throw new UnauthorizedException("Invalid verification code");
        }

        // Verify and clear code
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpires(null);
        userRepository.save(user);

        log.info("Email verified for: {}", user.getEmail());
    }

    private String generateCode() {
        int code = RANDOM.nextInt(900000) + 100000; // 6-digit: 100000-999999
        return String.valueOf(code);
    }
}
