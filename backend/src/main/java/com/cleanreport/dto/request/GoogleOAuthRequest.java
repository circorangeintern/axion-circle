package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Google OAuth login request")
public class GoogleOAuthRequest {

    @NotBlank(message = "Google ID token is required")
    @Schema(description = "Google ID token obtained from Google Sign-In on the frontend", example = "eyJhbGciOiJSUzI1NiIs...")
    private String idToken;
}
