package com.cleanreport.service;

import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.CreditTransactionResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.CreditTransaction;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserLevel;
import com.cleanreport.repository.CreditTransactionRepository;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Credit System v2 — Harder to earn, more rewarding.
 *
 * Earning rates (base):
 * - Report submitted: +2
 * - Report verified/acknowledged: +5
 * - Report resolved: +10
 * - First report ever: +5 bonus
 * - Streak milestones: +3/+8/+15/+30/+50
 *
 * Level multiplier applied to all earnings:
 * - OBSERVER: 1.0x, REPORTER: 1.0x, GUARDIAN: 1.2x, CHAMPION: 1.5x, LEGEND: 2.0x
 *
 * Lifetime credits track total earned (never decrease on spending).
 * Level is based on lifetime, not balance.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreditService {

    private static final int CREDIT_SUBMIT = 2;
    private static final int CREDIT_ACKNOWLEDGED = 5;
    private static final int CREDIT_RESOLVED = 10;
    private static final int CREDIT_FIRST_REPORT = 5;

    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final StreakService streakService;

    /**
     * Award credits when a report is submitted.
     */
    @Transactional
    public void awardReportSubmitCredits(User reporter, Report report) {
        int baseAmount = CREDIT_SUBMIT;

        // First report bonus
        long reportCount = reportRepository.findByReporterId(reporter.getId()).size();
        if (reportCount <= 1) {
            baseAmount += CREDIT_FIRST_REPORT;
            awardCredits(reporter, report, CREDIT_FIRST_REPORT, "First report bonus!");
        }

        awardCredits(reporter, report, applyMultiplier(reporter, CREDIT_SUBMIT), "Report submitted: " + report.getReferenceNumber());

        // Update streak and award streak bonus if milestone hit
        int streakBonus = streakService.updateStreak(reporter);
        if (streakBonus > 0) {
            awardCredits(reporter, report, applyMultiplier(reporter, streakBonus),
                    "Streak bonus (" + reporter.getStreakCount() + " days): " + report.getReferenceNumber());
        }

        // Check level up
        streakService.updateLevel(reporter);
    }

    /**
     * Award credits when a report is acknowledged by admin.
     */
    @Transactional
    public void awardAcknowledgedCredits(Report report) {
        User reporter = report.getReporter();
        int amount = applyMultiplier(reporter, CREDIT_ACKNOWLEDGED);
        awardCredits(reporter, report, amount, "Report verified: " + report.getReferenceNumber());
        streakService.updateLevel(reporter);
    }

    /**
     * Award credits when a report is resolved.
     */
    @Transactional
    public void awardResolvedCredits(Report report) {
        User reporter = report.getReporter();
        int amount = applyMultiplier(reporter, CREDIT_RESOLVED);
        awardCredits(reporter, report, amount, "Report resolved: " + report.getReferenceNumber());
        streakService.updateLevel(reporter);
    }

    /**
     * Get credit balance for authenticated user.
     */
    public CreditBalanceResponse getBalance(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return CreditBalanceResponse.builder()
                .userId(user.getId())
                .displayName(user.getDisplayName())
                .balance(user.getCreditBalance())
                .lifetimeCredits(user.getLifetimeCredits())
                .level(user.getLevel().name())
                .streakCount(user.getStreakCount())
                .nextLevelAt(getNextLevelThreshold(user.getLevel()))
                .multiplier(user.getLevel().getMultiplier())
                .build();
    }

    /**
     * Get credit transaction history for authenticated user.
     */
    public Page<CreditTransactionResponse> getHistory(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        return creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    private int applyMultiplier(User user, int baseAmount) {
        double multiplier = user.getLevel().getMultiplier();
        return (int) Math.round(baseAmount * multiplier);
    }

    private void awardCredits(User user, Report report, int amount, String reason) {
        CreditTransaction transaction = CreditTransaction.builder()
                .user(user)
                .report(report)
                .amount(amount)
                .reason(reason)
                .build();
        creditTransactionRepository.save(transaction);

        user.setCreditBalance(user.getCreditBalance() + amount);
        user.setLifetimeCredits(user.getLifetimeCredits() + amount);
        userRepository.save(user);

        log.info("Awarded {} credits to {} (lifetime: {}, level: {})",
                amount, user.getEmail(), user.getLifetimeCredits(), user.getLevel());
    }

    private int getNextLevelThreshold(UserLevel level) {
        return switch (level) {
            case OBSERVER -> 50;
            case REPORTER -> 200;
            case GUARDIAN -> 500;
            case CHAMPION -> 1000;
            case LEGEND -> -1; // Max level
        };
    }

    private CreditTransactionResponse mapToResponse(CreditTransaction tx) {
        return CreditTransactionResponse.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .reason(tx.getReason())
                .reportId(tx.getReport() != null ? tx.getReport().getId() : null)
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
