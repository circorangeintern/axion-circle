package com.cleanreport.service;

import com.cleanreport.dto.request.UpdateStatusRequest;
import com.cleanreport.dto.response.StatusHistoryResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.StatusHistory;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.StatusHistoryRepository;
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
public class StatusService {

    private static final List<ReportStatus> STATUS_ORDER = List.of(
            ReportStatus.REPORTED,
            ReportStatus.ACKNOWLEDGED,
            ReportStatus.IN_PROGRESS,
            ReportStatus.RESOLVED
    );

    private final ReportRepository reportRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;

    /**
     * Update a report's status. Only forward transitions allowed.
     * Records the change in status_history.
     */
    @Transactional
    public StatusHistoryResponse updateStatus(UUID reportId, UpdateStatusRequest request, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + adminEmail));

        ReportStatus currentStatus = report.getStatus();
        ReportStatus newStatus = request.getStatus();

        validateForwardTransition(currentStatus, newStatus);

        // Record history
        StatusHistory history = StatusHistory.builder()
                .report(report)
                .changedBy(admin)
                .oldStatus(currentStatus)
                .newStatus(newStatus)
                .note(request.getNote())
                .build();
        statusHistoryRepository.save(history);

        // Update report status
        report.setStatus(newStatus);
        reportRepository.save(report);

        log.info("Report {} status changed: {} → {} by {}", report.getReferenceNumber(), currentStatus, newStatus, adminEmail);

        return mapToResponse(history);
    }

    /**
     * Get full status history for a report, newest first.
     */
    public List<StatusHistoryResponse> getHistory(UUID reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new ResourceNotFoundException("Report not found: " + reportId);
        }
        return statusHistoryRepository.findByReportIdOrderByCreatedAtDesc(reportId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validateForwardTransition(ReportStatus current, ReportStatus target) {
        int currentIndex = STATUS_ORDER.indexOf(current);
        int targetIndex = STATUS_ORDER.indexOf(target);

        if (targetIndex <= currentIndex) {
            throw new IllegalArgumentException(
                    String.format("Cannot transition from %s to %s. Status can only move forward: REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED",
                            current, target));
        }
    }

    private StatusHistoryResponse mapToResponse(StatusHistory history) {
        return StatusHistoryResponse.builder()
                .id(history.getId())
                .changedByName(history.getChangedBy().getDisplayName())
                .changedById(history.getChangedBy().getId())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
