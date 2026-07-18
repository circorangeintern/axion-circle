package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.AreaStatsResponse;
import com.cleanreport.service.AreaStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/areas")
@RequiredArgsConstructor
@Tag(name = "Area Statistics", description = "District overview and area-level report statistics")
public class AreaStatsController {

    private final AreaStatsService areaStatsService;

    @Operation(
            summary = "Get area statistics / district overview",
            description = """
                    Returns report counts grouped by area_name (district).
                    Shows total, resolved, pending per area. Sorted by total reports descending.
                    **Public endpoint.**
                    """)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<List<AreaStatsResponse>>> getAreaStats() {
        List<AreaStatsResponse> stats = areaStatsService.getAreaStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @Operation(
            summary = "Get stats for a specific area/district",
            description = "Returns detailed stats for a single area by name (partial match).")
    @GetMapping("/stats/{areaName}")
    public ResponseEntity<ApiResponse<AreaStatsResponse>> getAreaStatsByName(
            @Parameter(description = "Area name (partial match)", example = "Lagos Island")
            @PathVariable String areaName) {
        AreaStatsResponse stats = areaStatsService.getStatsByArea(areaName);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
