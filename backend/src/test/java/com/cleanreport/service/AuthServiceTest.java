package com.cleanreport.service;

import com.cleanreport.dto.request.LoginRequest;
import com.cleanreport.dto.request.RegisterRequest;
import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.exception.ConflictException;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("amaka@example.com")
                .passwordHash("$2a$12$hashedpassword")
                .displayName("Amaka Obi")
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .isAnonymous(false)
                .build();
    }

    // === REGISTER TESTS ===

    @Test
    @DisplayName("register - success - creates user and returns tokens")
    void register_success() {
        RegisterRequest request = new RegisterRequest("amaka@example.com", "password123", "Amaka Obi");

        when(userRepository.existsByEmail("amaka@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$12$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(), anyString())).thenReturn("refresh-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getUser().getEmail()).isEqualTo("amaka@example.com");
        assertThat(response.getUser().getDisplayName()).isEqualTo("Amaka Obi");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.REPORTER);
        assertThat(response.getUser().getCreditBalance()).isEqualTo(0);

        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    @DisplayName("register - duplicate email - throws ConflictException")
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest("amaka@example.com", "password123", "Amaka Obi");
        when(userRepository.existsByEmail("amaka@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    // === LOGIN TESTS ===

    @Test
    @DisplayName("login - success - returns tokens for valid credentials")
    void login_success() {
        LoginRequest request = new LoginRequest("amaka@example.com", "password123");

        when(userRepository.findByEmail("amaka@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "$2a$12$hashedpassword")).thenReturn(true);
        when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(), anyString())).thenReturn("refresh-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getUser().getEmail()).isEqualTo("amaka@example.com");
    }

    @Test
    @DisplayName("login - unknown email - throws UnauthorizedException")
    void login_unknownEmail_throwsUnauthorized() {
        LoginRequest request = new LoginRequest("unknown@example.com", "password123");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("login - wrong password - throws UnauthorizedException")
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest request = new LoginRequest("amaka@example.com", "wrongpassword");

        when(userRepository.findByEmail("amaka@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$12$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }
}
