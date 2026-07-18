package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Facebook OAuth login request")
public class FacebookOAuthRequest {

    @NotBlank(message = "Facebook access token is required")
    @Schema(description = "Facebook access token from Facebook Login SDK", example = "EAAGm...")
    private String accessToken;
}
