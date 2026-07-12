package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Registration request")
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(example = "amaka@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(example = "mypassword123")
    private String password;

    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 100, message = "Display name must be 2-100 characters")
    @Schema(example = "Amaka Obi")
    private String displayName;
}
