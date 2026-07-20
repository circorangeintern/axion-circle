package com.cleanreport.dto.response;

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
@Schema(description = "User credit balance with level and streak info")
public class CreditBalanceResponse {

    private UUID userId;
    private String displayName;

    @Schema(description = "Current spendable credit balance", example = "85")
    private Integer balance;

    @Schema(description = "Total credits earned all-time (never decreases)", example = "230")
    private Integer lifetimeCredits;

    @Schema(description = "Current user level", example = "GUARDIAN")
    private String level;

    @Schema(description = "Current daily streak count", example = "7")
    private Integer streakCount;

    @Schema(description = "Lifetime credits needed for next level (-1 if max)", example = "500")
    private Integer nextLevelAt;

    @Schema(description = "Current earning multiplier from level", example = "1.2")
    private Double multiplier;
}
