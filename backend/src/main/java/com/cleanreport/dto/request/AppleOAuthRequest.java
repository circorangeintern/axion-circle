package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Apple Sign-In request")
public class AppleOAuthRequest {

    @NotBlank(message = "Identity token is required")
    @Schema(description = "Apple identity token from Sign In with Apple JS")
    private String identityToken;

    @NotBlank(message = "Email is required")
    @Email
    @Schema(description = "User email (Apple only sends on first sign-in, frontend must pass it)")
    private String email;

    @Schema(description = "User's full name (Apple only sends on first sign-in)")
    private String fullName;
}
