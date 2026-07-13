package com.cleanreport.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cleanReportOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CleanReport API")
                        .version("1.0.0")
                        .description("""
                                # CleanReport — Community Waste & Sanitation Issue Reporting
                                
                                ## Overview
                                REST API for reporting sanitation issues (overflowing bins, illegal dumping, blocked drains) 
                                with photo evidence and GPS location. Reports are publicly visible and tracked through a 
                                status lifecycle (Reported → Acknowledged → In Progress → Resolved).
                                
                                ## Authentication
                                Most write endpoints require a JWT Bearer token. Get a token by calling `/auth/register` or `/auth/login`.
                                Then click the **Authorize** button above and enter: `Bearer <your-token>`
                                
                                Token expiry:
                                - **Access token:** 15 minutes
                                - **Refresh token:** 7 days
                                
                                ## Standard Response Format
                                All responses follow this envelope:
                                ```json
                                {
                                  "success": true/false,
                                  "message": "Human-readable message",
                                  "data": { ... },
                                  "timestamp": "2026-07-13T12:00:00Z"
                                }
                                ```
                                
                                ## Error Codes
                                | HTTP Code | Meaning | When |
                                |-----------|---------|------|
                                | 400 | Bad Request | Validation failed (missing/invalid fields) |
                                | 401 | Unauthorized | Missing or invalid JWT token, or wrong credentials |
                                | 403 | Forbidden | Valid token but insufficient permissions (e.g. non-admin accessing /admin) |
                                | 404 | Not Found | Resource doesn't exist (report ID, user) |
                                | 409 | Conflict | Duplicate resource (email already registered) |
                                | 413 | Payload Too Large | File exceeds 5MB limit |
                                | 500 | Internal Server Error | Unexpected server error |
                                
                                ## Error Response Format
                                ```json
                                {
                                  "success": false,
                                  "message": "Description of what went wrong",
                                  "errors": { "fieldName": "specific error" },
                                  "timestamp": "2026-07-13T12:00:00Z"
                                }
                                ```
                                
                                ## Enums
                                **ReportCategory:** `OVERFLOW` | `ILLEGAL_DUMPING` | `BLOCKED_DRAIN`
                                
                                **ReportStatus:** `REPORTED` | `ACKNOWLEDGED` | `IN_PROGRESS` | `RESOLVED`
                                
                                **ReportUrgency:** `ROUTINE` | `URGENT` | `CRITICAL`
                                
                                **UserRole:** `REPORTER` | `ADMIN`
                                
                                ## Rate Limits
                                - 100 requests per minute per IP (free tier)
                                
                                ## Base URL
                                Production: `https://cleanreport-api.onrender.com/api/v1`
                                """)
                        .contact(new Contact()
                                .name("Axion Circle — Orange Internship")
                                .url("https://github.com/circorangeintern/axion-circle")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token from /auth/login or /auth/register. " +
                                        "Format: `Bearer eyJhbGciOiJ...`"))
                        .addResponses("400", new ApiResponse()
                                .description("Bad Request — validation failed")
                                .content(new Content().addMediaType("application/json",
                                        new MediaType().example(Map.of(
                                                "success", false,
                                                "message", "Validation failed",
                                                "errors", Map.of("email", "Invalid email format", "password", "Password must be at least 8 characters"),
                                                "timestamp", "2026-07-13T12:00:00Z")))))
                        .addResponses("401", new ApiResponse()
                                .description("Unauthorized — missing/invalid token or wrong credentials")
                                .content(new Content().addMediaType("application/json",
                                        new MediaType().example(Map.of(
                                                "success", false,
                                                "message", "Invalid email or password",
                                                "errors", Map.of(),
                                                "timestamp", "2026-07-13T12:00:00Z")))))
                        .addResponses("404", new ApiResponse()
                                .description("Not Found — resource does not exist")
                                .content(new Content().addMediaType("application/json",
                                        new MediaType().example(Map.of(
                                                "success", false,
                                                "message", "Report not found: 550e8400-e29b-41d4-a716-446655440000",
                                                "errors", Map.of(),
                                                "timestamp", "2026-07-13T12:00:00Z")))))
                        .addResponses("409", new ApiResponse()
                                .description("Conflict — duplicate resource")
                                .content(new Content().addMediaType("application/json",
                                        new MediaType().example(Map.of(
                                                "success", false,
                                                "message", "Email already registered: user@example.com",
                                                "errors", Map.of(),
                                                "timestamp", "2026-07-13T12:00:00Z"))))));
    }
}
