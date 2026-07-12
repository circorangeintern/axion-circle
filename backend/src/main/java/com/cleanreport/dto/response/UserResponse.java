package com.cleanreport.dto.response;

import com.cleanreport.model.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User details response")
public class UserResponse {

    @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(example = "amaka@example.com")
    private String email;

    @Schema(example = "Amaka Obi")
    private String displayName;

    @Schema(example = "REPORTER")
    private UserRole role;

    @Schema(example = "0")
    private Integer creditBalance;
}
