package com.cleanreport.service;

import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Reward;
import com.cleanreport.model.entity.RewardClaim;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ClaimStatus;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.RewardClaimRepository;
import com.cleanreport.repository.RewardRepository;
import com.cleanreport.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    private static final UUID TEST_REWARD_ID = UUID.randomUUID();
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String TEST_EMAIL = "user@test.com";

    @Mock private RewardRepository rewardRepository;
    @Mock private RewardClaimRepository rewardClaimRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private RewardService rewardService;

    private User testUser;
    private Reward testReward;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(TEST_USER_ID).email(TEST_EMAIL)
                .displayName("Test User").role(UserRole.REPORTER).creditBalance(100).build();
        testReward = Reward.builder().id(TEST_REWARD_ID).name("Free Coffee")
                .creditsRequired(50).quantityAvailable(10).isActive(true).build();
    }

    @Test
    @DisplayName("getActiveRewards - returns active rewards sorted")
    void getActiveRewards_returnsSorted() {
        when(rewardRepository.findByIsActiveTrueOrderByCreditsRequiredAsc()).thenReturn(List.of(testReward));

        List<Reward> result = rewardService.getActiveRewards();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Free Coffee");
    }

    @Test
    @DisplayName("claimReward - success - deducts credits and creates claim")
    void claimReward_success() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardRepository.findById(TEST_REWARD_ID)).thenReturn(Optional.of(testReward));
        when(rewardClaimRepository.save(any(RewardClaim.class))).thenAnswer(inv -> {
            RewardClaim c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(rewardRepository.save(any(Reward.class))).thenReturn(testReward);

        RewardClaim claim = rewardService.claimReward(TEST_REWARD_ID, TEST_EMAIL);

        assertThat(claim.getStatus()).isEqualTo(ClaimStatus.PENDING);
        assertThat(testUser.getCreditBalance()).isEqualTo(50); // 100 - 50
        assertThat(testReward.getQuantityAvailable()).isEqualTo(9); // 10 - 1
    }

    @Test
    @DisplayName("claimReward - insufficient credits - throws")
    void claimReward_insufficientCredits_throws() {
        testUser.setCreditBalance(20); // Only 20, need 50
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardRepository.findById(TEST_REWARD_ID)).thenReturn(Optional.of(testReward));

        assertThatThrownBy(() -> rewardService.claimReward(TEST_REWARD_ID, TEST_EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient credits");

        verify(rewardClaimRepository, never()).save(any());
    }

    @Test
    @DisplayName("claimReward - out of stock - throws")
    void claimReward_outOfStock_throws() {
        testReward.setQuantityAvailable(0);
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardRepository.findById(TEST_REWARD_ID)).thenReturn(Optional.of(testReward));

        assertThatThrownBy(() -> rewardService.claimReward(TEST_REWARD_ID, TEST_EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("out of stock");
    }

    @Test
    @DisplayName("claimReward - inactive reward - throws")
    void claimReward_inactive_throws() {
        testReward.setIsActive(false);
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardRepository.findById(TEST_REWARD_ID)).thenReturn(Optional.of(testReward));

        assertThatThrownBy(() -> rewardService.claimReward(TEST_REWARD_ID, TEST_EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no longer available");
    }

    @Test
    @DisplayName("claimReward - reward not found - throws")
    void claimReward_rewardNotFound_throws() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardRepository.findById(TEST_REWARD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rewardService.claimReward(TEST_REWARD_ID, TEST_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getMyClaims - returns user's claims")
    void getMyClaims_success() {
        RewardClaim claim = RewardClaim.builder().id(UUID.randomUUID())
                .user(testUser).reward(testReward).status(ClaimStatus.PENDING).build();
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(rewardClaimRepository.findByUserIdOrderByClaimedAtDesc(TEST_USER_ID)).thenReturn(List.of(claim));

        List<RewardClaim> result = rewardService.getMyClaims(TEST_EMAIL);

        assertThat(result).hasSize(1);
    }
}
