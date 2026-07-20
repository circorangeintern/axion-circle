package com.cleanreport.service;

import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Reward;
import com.cleanreport.model.entity.RewardClaim;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ClaimStatus;
import com.cleanreport.repository.RewardClaimRepository;
import com.cleanreport.repository.RewardRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardClaimRepository rewardClaimRepository;
    private final UserRepository userRepository;

    /**
     * Get all active rewards, sorted by credits required (cheapest first).
     */
    public List<Reward> getActiveRewards() {
        return rewardRepository.findByIsActiveTrueOrderByCreditsRequiredAsc();
    }

    /**
     * Claim a reward. Deducts credits from user balance.
     */
    @Transactional
    public RewardClaim claimReward(UUID rewardId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found: " + rewardId));

        if (!reward.getIsActive()) {
            throw new IllegalArgumentException("This reward is no longer available");
        }

        if (reward.getQuantityAvailable() <= 0) {
            throw new IllegalArgumentException("This reward is out of stock");
        }

        if (user.getCreditBalance() < reward.getCreditsRequired()) {
            throw new IllegalArgumentException(
                    String.format("Insufficient credits. You have %d, need %d",
                            user.getCreditBalance(), reward.getCreditsRequired()));
        }

        // Deduct credits
        user.setCreditBalance(user.getCreditBalance() - reward.getCreditsRequired());
        userRepository.save(user);

        // Decrement stock
        reward.setQuantityAvailable(reward.getQuantityAvailable() - 1);
        rewardRepository.save(reward);

        // Create claim with generated redemption code
        RewardClaim claim = RewardClaim.builder()
                .user(user)
                .reward(reward)
                .status(ClaimStatus.PENDING)
                .redemptionCode(generateRedemptionCode())
                .build();

        RewardClaim saved = rewardClaimRepository.save(claim);
        log.info("Reward claimed: {} by {} (-{} credits)", reward.getName(), userEmail, reward.getCreditsRequired());

        return saved;
    }

    /**
     * Get user's claim history.
     */
    public List<RewardClaim> getMyClaims(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return rewardClaimRepository.findByUserIdOrderByClaimedAtDesc(user.getId());
    }

    /**
     * Generate a unique digital redemption code.
     * Format: CR-XXXX-XXXX-XXXX (12 alphanumeric chars)
     */
    private String generateRedemptionCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 (avoid confusion)
        StringBuilder code = new StringBuilder("CR-");
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 12; i++) {
            if (i > 0 && i % 4 == 0) code.append("-");
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}
