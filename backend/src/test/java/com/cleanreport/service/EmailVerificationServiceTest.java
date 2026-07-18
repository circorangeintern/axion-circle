package com.cleanreport.service;

import com.cleanreport.exception.ResourceNotFoundException;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    private static final String TEST_EMAIL = "user@gmail.com";

    @Mock private UserRepository userRepository;
    @InjectMocks private EmailVerificationService emailVerificationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(UUID.randomUUID()).email(TEST_EMAIL)
                .displayName("Test").role(UserRole.REPORTER).emailVerified(false).build();
    }

    @Test
    @DisplayName("sendVerificationCode - generates 6 digit code and saves")
    void sendCode_generates6Digits() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        emailVerificationService.sendVerificationCode(testUser);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getVerificationCode()).hasSize(6);
        assertThat(captor.getValue().getVerificationCodeExpires()).isAfter(Instant.now());
    }

    @Test
    @DisplayName("verifyEmail - valid code - marks verified and clears code")
    void verifyEmail_validCode_success() {
        testUser.setVerificationCode("123456");
        testUser.setVerificationCodeExpires(Instant.now().plus(5, ChronoUnit.MINUTES));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        emailVerificationService.verifyEmail(TEST_EMAIL, "123456");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmailVerified()).isTrue();
        assertThat(captor.getValue().getVerificationCode()).isNull();
    }

    @Test
    @DisplayName("verifyEmail - wrong code - throws Unauthorized")
    void verifyEmail_wrongCode_throws() {
        testUser.setVerificationCode("123456");
        testUser.setVerificationCodeExpires(Instant.now().plus(5, ChronoUnit.MINUTES));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> emailVerificationService.verifyEmail(TEST_EMAIL, "999999"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid verification code");
    }

    @Test
    @DisplayName("verifyEmail - expired code - throws Unauthorized")
    void verifyEmail_expiredCode_throws() {
        testUser.setVerificationCode("123456");
        testUser.setVerificationCodeExpires(Instant.now().minus(5, ChronoUnit.MINUTES));
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertThatThrownBy(() -> emailVerificationService.verifyEmail(TEST_EMAIL, "123456"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("verifyEmail - already verified - throws IllegalArgument")
    void verifyEmail_alreadyVerified_throws() {
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> emailVerificationService.verifyEmail(TEST_EMAIL, "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already verified");
    }

    @Test
    @DisplayName("resendVerificationCode - user not found - throws")
    void resend_userNotFound_throws() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.resendVerificationCode("unknown@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
