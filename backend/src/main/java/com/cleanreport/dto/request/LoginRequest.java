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
@Schema(description = "Login request")
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(example = "amaka@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "mypassword123")
    private String password;

    @Schema(description = "If true, refresh token lasts 30 days instead of 7", example = "false")
    private Boolean rememberMe;
}
