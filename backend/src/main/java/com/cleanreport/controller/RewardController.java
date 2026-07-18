package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.model.entity.Reward;
import com.cleanreport.model.entity.RewardClaim;
import com.cleanreport.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards", description = "Browse reward catalog and claim rewards with credits")
public class RewardController {

    private final RewardService rewardService;

    @Operation(
            summary = "Get active rewards catalog",
            description = "Returns all available rewards sorted by credits required (cheapest first). **Public endpoint.**")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Reward>>> getRewards() {
        List<Reward> rewards = rewardService.getActiveRewards();
        return ResponseEntity.ok(ApiResponse.ok(rewards));
    }

    @Operation(
            summary = "Claim a reward",
            description = """
                    Spend credits to claim a reward. Deducts credits from balance immediately.
                    Returns 400 if insufficient credits or reward out of stock.
                    Claim status starts as PENDING (admin approves later).
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/{rewardId}/claim")
    public ResponseEntity<ApiResponse<RewardClaim>> claimReward(
            @Parameter(description = "Reward UUID to claim") @PathVariable UUID rewardId,
            Authentication authentication) {
        RewardClaim claim = rewardService.claimReward(rewardId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(claim, "Reward claimed successfully"));
    }

    @Operation(
            summary = "Get my reward claims",
            description = "Returns all rewards claimed by the authenticated user, newest first.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/my-claims")
    public ResponseEntity<ApiResponse<List<RewardClaim>>> getMyClaims(Authentication authentication) {
        List<RewardClaim> claims = rewardService.getMyClaims(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(claims));
    }
}
