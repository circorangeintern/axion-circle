package com.cleanreport.model.entity;

import com.cleanreport.model.enums.ClaimStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reward_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(name = "claimed_at", nullable = false, updatable = false)
    private Instant claimedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "collected_at")
    private Instant collectedAt;

    @PrePersist
    protected void onCreate() {
        claimedAt = Instant.now();
    }
}
