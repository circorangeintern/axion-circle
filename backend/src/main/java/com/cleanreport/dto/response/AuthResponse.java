package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response with tokens")
public class AuthResponse {

    @Schema(description = "JWT access token (15 min expiry)")
    private String accessToken;

    @Schema(description = "JWT refresh token (7 day expiry)")
    private String refreshToken;

    @Schema(description = "Authenticated user details")
    private UserResponse user;
}
