package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dashboard statistics")
public class DashboardStatsResponse {

    @Schema(description = "Total number of reports", example = "142")
    private long totalReports;

    @Schema(description = "Count of resolved reports", example = "87")
    private long resolvedReports;

    @Schema(description = "Count of pending reports (reported + acknowledged + in_progress)", example = "55")
    private long pendingReports;

    @Schema(description = "Reports count grouped by status", example = "{\"REPORTED\": 20, \"ACKNOWLEDGED\": 15, \"IN_PROGRESS\": 20, \"RESOLVED\": 87}")
    private Map<String, Long> byStatus;

    @Schema(description = "Reports count grouped by category", example = "{\"OVERFLOW\": 30, \"ILLEGAL_DUMPING\": 45}")
    private Map<String, Long> byCategory;

    @Schema(description = "Total community credits earned", example = "1420")
    private long totalCreditsEarned;

    @Schema(description = "Number of registered users", example = "38")
    private long totalUsers;

    /**
     * Returns unmodifiable view of status map to prevent external mutation.
     */
    public Map<String, Long> getByStatus() {
        return byStatus != null ? Collections.unmodifiableMap(byStatus) : null;
    }

    /**
     * Returns unmodifiable view of category map to prevent external mutation.
     */
    public Map<String, Long> getByCategory() {
        return byCategory != null ? Collections.unmodifiableMap(byCategory) : null;
    }
}
