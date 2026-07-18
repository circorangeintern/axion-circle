package com.cleanreport.service;

import com.cleanreport.dto.request.UpdateStatusRequest;
import com.cleanreport.dto.response.StatusHistoryResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.StatusHistory;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.StatusHistoryRepository;
import com.cleanreport.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatusServiceTest {

    private static final UUID TEST_REPORT_ID = UUID.randomUUID();
    private static final UUID TEST_ADMIN_ID = UUID.randomUUID();
    private static final String TEST_ADMIN_EMAIL = "admin@cleanreport.com";
    private static final String TEST_ADMIN_NAME = "Admin User";

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StatusService statusService;

    private Report testReport;
    private User testAdmin;

    @BeforeEach
    void setUp() {
        testAdmin = User.builder()
                .id(TEST_ADMIN_ID)
                .email(TEST_ADMIN_EMAIL)
                .displayName(TEST_ADMIN_NAME)
                .role(UserRole.ADMIN)
                .build();

        testReport = Report.builder()
                .id(TEST_REPORT_ID)
                .referenceNumber("CR-00001")
                .status(ReportStatus.REPORTED)
                .build();
    }

    @Test
    @DisplayName("updateStatus - forward transition REPORTED→ACKNOWLEDGED - succeeds")
    void updateStatus_forwardTransition_succeeds() {
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.ACKNOWLEDGED, "Team notified");

        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));
        when(statusHistoryRepository.save(any(StatusHistory.class))).thenAnswer(inv -> {
            StatusHistory h = inv.getArgument(0);
            h.setId(UUID.randomUUID());
            h.setCreatedAt(Instant.now());
            return h;
        });
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        StatusHistoryResponse response = statusService.updateStatus(TEST_REPORT_ID, request, TEST_ADMIN_EMAIL);

        assertThat(response.getOldStatus()).isEqualTo(ReportStatus.REPORTED);
        assertThat(response.getNewStatus()).isEqualTo(ReportStatus.ACKNOWLEDGED);
        assertThat(response.getNote()).isEqualTo("Team notified");
        assertThat(response.getChangedByName()).isEqualTo(TEST_ADMIN_NAME);

        // Verify report was updated
        ArgumentCaptor<Report> reportCaptor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(reportCaptor.capture());
        assertThat(reportCaptor.getValue().getStatus()).isEqualTo(ReportStatus.ACKNOWLEDGED);
    }

    @Test
    @DisplayName("updateStatus - skip to RESOLVED from REPORTED - succeeds (forward)")
    void updateStatus_skipSteps_succeeds() {
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.RESOLVED, "Immediate resolution");

        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));
        when(statusHistoryRepository.save(any(StatusHistory.class))).thenAnswer(inv -> {
            StatusHistory h = inv.getArgument(0);
            h.setId(UUID.randomUUID());
            h.setCreatedAt(Instant.now());
            return h;
        });
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        StatusHistoryResponse response = statusService.updateStatus(TEST_REPORT_ID, request, TEST_ADMIN_EMAIL);

        assertThat(response.getNewStatus()).isEqualTo(ReportStatus.RESOLVED);
    }

    @Test
    @DisplayName("updateStatus - backward transition ACKNOWLEDGED→REPORTED - throws IllegalArgument")
    void updateStatus_backwardTransition_throws() {
        testReport.setStatus(ReportStatus.ACKNOWLEDGED);
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.REPORTED, "Trying to go back");

        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));

        assertThatThrownBy(() -> statusService.updateStatus(TEST_REPORT_ID, request, TEST_ADMIN_EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot transition from ACKNOWLEDGED to REPORTED");

        verify(statusHistoryRepository, never()).save(any());
        verify(reportRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStatus - same status - throws IllegalArgument")
    void updateStatus_sameStatus_throws() {
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.REPORTED, "No change");

        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));

        assertThatThrownBy(() -> statusService.updateStatus(TEST_REPORT_ID, request, TEST_ADMIN_EMAIL))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot transition from REPORTED to REPORTED");
    }

    @Test
    @DisplayName("updateStatus - report not found - throws ResourceNotFoundException")
    void updateStatus_reportNotFound_throws() {
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.ACKNOWLEDGED, null);
        UUID unknownId = UUID.randomUUID();

        when(reportRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> statusService.updateStatus(unknownId, request, TEST_ADMIN_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Report not found");
    }

    @Test
    @DisplayName("updateStatus - admin not found - throws ResourceNotFoundException")
    void updateStatus_adminNotFound_throws() {
        UpdateStatusRequest request = new UpdateStatusRequest(ReportStatus.ACKNOWLEDGED, null);

        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> statusService.updateStatus(TEST_REPORT_ID, request, "unknown@test.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("getHistory - returns entries newest first")
    void getHistory_returnsNewestFirst() {
        StatusHistory h1 = StatusHistory.builder()
                .id(UUID.randomUUID())
                .changedBy(testAdmin)
                .oldStatus(ReportStatus.REPORTED)
                .newStatus(ReportStatus.ACKNOWLEDGED)
                .note("Noted")
                .createdAt(Instant.now().minusSeconds(60))
                .build();
        StatusHistory h2 = StatusHistory.builder()
                .id(UUID.randomUUID())
                .changedBy(testAdmin)
                .oldStatus(ReportStatus.ACKNOWLEDGED)
                .newStatus(ReportStatus.IN_PROGRESS)
                .note("Team dispatched")
                .createdAt(Instant.now())
                .build();

        when(reportRepository.existsById(TEST_REPORT_ID)).thenReturn(true);
        when(statusHistoryRepository.findByReportIdOrderByCreatedAtDesc(TEST_REPORT_ID))
                .thenReturn(List.of(h2, h1));

        List<StatusHistoryResponse> result = statusService.getHistory(TEST_REPORT_ID);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNewStatus()).isEqualTo(ReportStatus.IN_PROGRESS);
        assertThat(result.get(1).getNewStatus()).isEqualTo(ReportStatus.ACKNOWLEDGED);
    }

    @Test
    @DisplayName("getHistory - report not found - throws ResourceNotFoundException")
    void getHistory_reportNotFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(reportRepository.existsById(unknownId)).thenReturn(false);

        assertThatThrownBy(() -> statusService.getHistory(unknownId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Report not found");
    }
}
