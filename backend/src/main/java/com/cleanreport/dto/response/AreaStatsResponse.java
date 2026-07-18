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
@Schema(description = "Area/district statistics")
public class AreaStatsResponse {

    @Schema(description = "Area/district name", example = "Lagos Island")
    private String areaName;

    @Schema(description = "Total reports in this area")
    private long totalReports;

    @Schema(description = "Resolved reports")
    private long resolvedReports;

    @Schema(description = "Pending (reported + acknowledged + in_progress)")
    private long pendingReports;

    @Schema(description = "Reports in the last 7 days")
    private long recentReports;
}
