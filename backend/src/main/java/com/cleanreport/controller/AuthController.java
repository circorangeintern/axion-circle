package com.cleanreport.controller;

import com.cleanreport.dto.request.LoginRequest;
import com.cleanreport.dto.request.RegisterRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.AuthResponse;
import com.cleanreport.service.AuthService;
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
}
