package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.LeaderboardEntry;
import com.cleanreport.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Community leaderboard showing top contributors")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Operation(
            summary = "Get community leaderboard",
            description = "Returns top contributors ranked by credit balance. Default top 20. **Public endpoint.**")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard(
            @Parameter(description = "Number of top users to return (max 50)", example = "20")
            @RequestParam(defaultValue = "20") int limit) {
        List<LeaderboardEntry> leaderboard = leaderboardService.getTopContributors(Math.min(limit, 50));
        return ResponseEntity.ok(ApiResponse.ok(leaderboard));
    }
}
