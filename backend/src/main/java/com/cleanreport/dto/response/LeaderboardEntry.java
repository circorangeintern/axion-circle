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
@Schema(description = "Leaderboard entry")
public class LeaderboardEntry {

    @Schema(description = "Rank position", example = "1")
    private int rank;

    private UUID userId;
    private String displayName;
    private String avatarUrl;

    @Schema(description = "Total credits earned", example = "250")
    private int creditBalance;

    @Schema(description = "Total reports submitted", example = "15")
    private long reportCount;
}
