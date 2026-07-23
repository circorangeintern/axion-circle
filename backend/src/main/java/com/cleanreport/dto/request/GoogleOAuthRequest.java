package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Google OAuth login request — send EITHER idToken OR code")
public class GoogleOAuthRequest {

    @Schema(description = "Google ID token (from One-Tap or legacy Credential flow)", example = "eyJhbGciOiJSUzI1NiIs...")
    private String idToken;

    @Schema(description = "Google authorization code (from GIS Custom Button / useGoogleLogin hook)", example = "4/0AfJohXl...")
    private String code;
}
