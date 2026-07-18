package com.cleanreport.service;

import com.cleanreport.dto.request.ForgotPasswordRequest;
import com.cleanreport.dto.request.ResetPasswordRequest;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    private static final String TEST_EMAIL = "user@test.com";
    private static final String VALID_TOKEN = "abc123token";

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email(TEST_EMAIL)
                .displayName("Test User")
                .role(UserRole.REPORTER)
                .passwordHash("old_hash")
                .build();
    }

    @Test
    @DisplayName("requestPasswordReset - existing email - generates token and saves")
    void requestReset_existingEmail_generatesToken() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        passwordResetService.requestPasswordReset(new ForgotPasswordRequest(TEST_EMAIL));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordResetToken()).isNotNull().isNotBlank();
        assertThat(captor.getValue().getPasswordResetExpires()).isAfter(Instant.now());
    }

    @Test
    @DisplayName("requestPasswordReset - non-existing email - does NOT throw (prevents enumeration)")
    void requestReset_unknownEmail_doesNotThrow() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // Should NOT throw — silent success
        passwordResetService.requestPasswordReset(new ForgotPasswordRequest("unknown@test.com"));

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword - valid token - updates password and clears token")
    void resetPassword_validToken_success() {
        testUser.setPasswordResetToken(VALID_TOKEN);
        testUser.setPasswordResetExpires(Instant.now().plus(10, ChronoUnit.MINUTES));

        when(userRepository.findByPasswordResetToken(VALID_TOKEN)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("NewPass123!")).thenReturn("new_encoded_hash");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        passwordResetService.resetPassword(new ResetPasswordRequest(VALID_TOKEN, "NewPass123!"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("new_encoded_hash");
        assertThat(captor.getValue().getPasswordResetToken()).isNull();
        assertThat(captor.getValue().getPasswordResetExpires()).isNull();
    }

    @Test
    @DisplayName("resetPassword - expired token - throws Unauthorized")
    void resetPassword_expiredToken_throws() {
        testUser.setPasswordResetToken(VALID_TOKEN);
        testUser.setPasswordResetExpires(Instant.now().minus(5, ChronoUnit.MINUTES));

        when(userRepository.findByPasswordResetToken(VALID_TOKEN)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertThatThrownBy(() -> passwordResetService.resetPassword(new ResetPasswordRequest(VALID_TOKEN, "NewPass123!")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("resetPassword - invalid token - throws Unauthorized")
    void resetPassword_invalidToken_throws() {
        when(userRepository.findByPasswordResetToken("bad_token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.resetPassword(new ResetPasswordRequest("bad_token", "NewPass123!")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid or expired");
    }
}
