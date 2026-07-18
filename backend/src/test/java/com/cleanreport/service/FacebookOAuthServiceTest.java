package com.cleanreport.service;

import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.UserRepository;
import com.cleanreport.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacebookOAuthServiceTest {

    private static final String TEST_EMAIL = "fbuser@gmail.com";
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;

    @InjectMocks private FacebookOAuthService facebookOAuthService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = User.builder().id(TEST_USER_ID).email(TEST_EMAIL)
                .displayName("FB User").role(UserRole.REPORTER).creditBalance(0)
                .emailVerified(true).build();
    }

    @Test
    @DisplayName("authenticateWithFacebook - invalid token - throws Unauthorized")
    void invalidToken_throws() {
        // An invalid token will cause RestTemplate to fail with 400 from Facebook
        assertThatThrownBy(() -> facebookOAuthService.authenticateWithFacebook("invalid_token_xyz"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Failed to verify Facebook token");
    }

    @Test
    @DisplayName("authenticateWithFacebook - empty token - throws (validation at controller level)")
    void emptyToken_handledByValidation() {
        // Empty string token will also fail at Facebook's API
        assertThatThrownBy(() -> facebookOAuthService.authenticateWithFacebook(""))
                .isInstanceOf(UnauthorizedException.class);
    }
}
