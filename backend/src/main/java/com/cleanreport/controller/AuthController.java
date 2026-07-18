package com.cleanreport.controller;

import com.cleanreport.dto.request.ForgotPasswordRequest;
import com.cleanreport.dto.request.GoogleOAuthRequest;
import com.cleanreport.dto.request.LoginRequest;
import com.cleanreport.dto.request.RefreshTokenRequest;
import com.cleanreport.dto.request.RegisterRequest;
import com.cleanreport.dto.request.ResetPasswordRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.service.AuthService;
import com.cleanreport.service.GoogleOAuthService;
import com.cleanreport.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration and login. Returns JWT tokens for authenticated requests.")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final PasswordResetService passwordResetService;

    @Operation(
            summary = "Register a new user",
            description = """
                    Creates a new account with REPORTER role. Returns JWT access token (15 min) 
                    and refresh token (7 days). The access token must be included in the 
                    Authorization header for all authenticated endpoints: `Authorization: Bearer <token>`
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "User registered successfully. Returns tokens + user details.",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Validation error — email invalid, password too short, or display name missing",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Validation failed","errors":{"email":"Invalid email format","password":"Password must be at least 8 characters"},"timestamp":"2026-07-13T12:00:00Z"}
                            """))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409",
                    description = "Email already registered",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Email already registered: user@example.com","errors":null,"timestamp":"2026-07-13T12:00:00Z"}
                            """)))
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "User registered successfully"));
    }

    @Operation(
            summary = "Login with email and password",
            description = """
                    Authenticates an existing user. Returns JWT access token (15 min) and 
                    refresh token (7 days). Use the access token in the Authorization header 
                    for protected endpoints.
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Login successful. Returns tokens + user details."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Invalid email or password",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Invalid email or password","errors":null,"timestamp":"2026-07-13T12:00:00Z"}
                            """)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @Operation(
            summary = "Refresh access token",
            description = """
                    Exchange a valid refresh token for a new access token + refresh token pair.
                    Call this when the access token expires (after 15 min) to avoid forcing re-login.
                    The old refresh token is invalidated.
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "New tokens issued"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Token refreshed successfully"));
    }

    @Operation(
            summary = "Login with Google OAuth",
            description = """
                    Exchange a Google ID token for CleanReport JWT tokens.
                    
                    **Frontend flow:**
                    1. User clicks "Sign in with Google" button
                    2. Google Sign-In returns an ID token
                    3. Frontend sends that token to this endpoint
                    4. Backend verifies with Google, creates user if first time, returns our JWT
                    
                    **Auto-creates user on first login** with REPORTER role.
                    If user already exists (same email), returns tokens for existing account.
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Google login successful. Returns JWT tokens + user details."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid Google token or email not verified")
    })
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleOAuthRequest request) {
        AuthResponse response = googleOAuthService.authenticateWithGoogle(request.getIdToken());
        return ResponseEntity.ok(ApiResponse.ok(response, "Google login successful"));
    }

    @Operation(
            summary = "Request password reset",
            description = """
                    Sends a password reset email with a time-limited token (15 min).
                    Always returns 200 even if email doesn't exist (prevents email enumeration).
                    """)
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "If an account with that email exists, a reset link has been sent."));
    }

    @Operation(
            summary = "Reset password with token",
            description = """
                    Validates the reset token from the email link and sets a new password.
                    Token expires after 15 minutes. Can only be used once.
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Password reset successful. You can now log in with your new password."));
    }

}
