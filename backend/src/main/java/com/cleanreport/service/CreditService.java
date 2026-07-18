package com.cleanreport.service;

import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.CreditTransactionResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.CreditTransaction;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.CreditTransactionRepository;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditService {

    @Value("${app.credits.report-submit:10}")
    private int creditReportSubmit;

    @Value("${app.credits.report-acknowledged:5}")
    private int creditReportAcknowledged;

    @Value("${app.credits.report-resolved:5}")
    private int creditReportResolved;

    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    /**
     * Award credits when a report is submitted.
     */
    @Transactional
    public void awardReportSubmitCredits(User reporter, Report report) {
        awardCredits(reporter, report, creditReportSubmit, "Report submitted: " + report.getReferenceNumber());
    }

    /**
     * Award credits when a report is acknowledged by admin.
     */
    @Transactional
    public void awardAcknowledgedCredits(Report report) {
        awardCredits(report.getReporter(), report, creditReportAcknowledged,
                "Report acknowledged: " + report.getReferenceNumber());
    }

    /**
     * Award credits when a report is resolved.
     */
    @Transactional
    public void awardResolvedCredits(Report report) {
        awardCredits(report.getReporter(), report, creditReportResolved,
                "Report resolved: " + report.getReferenceNumber());
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

    private void awardCredits(User user, Report report, int amount, String reason) {
        CreditTransaction transaction = CreditTransaction.builder()
                .user(user)
                .report(report)
                .amount(amount)
                .reason(reason)
                .build();
        creditTransactionRepository.save(transaction);

        user.setCreditBalance(user.getCreditBalance() + amount);
        userRepository.save(user);

        log.info("Awarded {} credits to user {} for: {}", amount, user.getEmail(), reason);
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
