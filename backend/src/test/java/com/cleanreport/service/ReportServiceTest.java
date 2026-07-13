package com.cleanreport.service;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.model.enums.ReportUrgency;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    private static final String TEST_EMAIL = "reporter@example.com";
    private static final String TEST_DISPLAY_NAME = "Test Reporter";
    private static final String TEST_PHOTO_URL = "https://res.cloudinary.com/test/image/upload/v1/reports/test.jpg";
    private static final double TEST_LATITUDE = 6.5244;
    private static final double TEST_LONGITUDE = 3.3792;
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_REPORT_ID = UUID.randomUUID();

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReportService reportService;

    private User testUser;
    private Report testReport;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(TEST_USER_ID)
                .email(TEST_EMAIL)
                .displayName(TEST_DISPLAY_NAME)
                .role(UserRole.REPORTER)
                .creditBalance(0)
                .build();

        var point = geometryFactory.createPoint(new Coordinate(TEST_LONGITUDE, TEST_LATITUDE));
        point.setSRID(4326);

        testReport = Report.builder()
                .id(TEST_REPORT_ID)
                .referenceNumber("CR-00001")
                .reporter(testUser)
                .photoUrl(TEST_PHOTO_URL)
                .location(point)
                .description("Test waste report")
                .category(ReportCategory.ILLEGAL_DUMPING)
                .status(ReportStatus.REPORTED)
                .urgency(ReportUrgency.ROUTINE)
                .isAnonymous(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("createReport - success - creates report with generated reference number")
    void createReport_success() {
        CreateReportRequest request = new CreateReportRequest(
                TEST_PHOTO_URL, TEST_LATITUDE, TEST_LONGITUDE,
                ReportCategory.ILLEGAL_DUMPING, "Waste near school", ReportUrgency.URGENT, false);

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        ReportResponse response = reportService.createReport(request, TEST_EMAIL);

        assertThat(response.getId()).isEqualTo(TEST_REPORT_ID);
        assertThat(response.getReferenceNumber()).startsWith("CR-");
        assertThat(response.getCategory()).isEqualTo(ReportCategory.ILLEGAL_DUMPING);
        assertThat(response.getStatus()).isEqualTo(ReportStatus.REPORTED);
        assertThat(response.getReporterName()).isEqualTo(TEST_DISPLAY_NAME);
        assertThat(response.getLatitude()).isEqualTo(TEST_LATITUDE);
        assertThat(response.getLongitude()).isEqualTo(TEST_LONGITUDE);

        verify(reportRepository).save(any(Report.class));
    }

    @Test
    @DisplayName("createReport - anonymous - hides reporter name")
    void createReport_anonymous_hidesName() {
        testReport = testReport.toBuilder().isAnonymous(true).build();
        CreateReportRequest request = new CreateReportRequest(
                TEST_PHOTO_URL, TEST_LATITUDE, TEST_LONGITUDE,
                ReportCategory.OVERFLOW, null, null, true);

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        ReportResponse response = reportService.createReport(request, TEST_EMAIL);

        assertThat(response.getReporterName()).isEqualTo("Anonymous");
        assertThat(response.getIsAnonymous()).isTrue();
    }

    @Test
    @DisplayName("createReport - unknown user - throws ResourceNotFoundException")
    void createReport_unknownUser_throwsNotFound() {
        CreateReportRequest request = new CreateReportRequest(
                TEST_PHOTO_URL, TEST_LATITUDE, TEST_LONGITUDE,
                ReportCategory.BLOCKED_DRAIN, null, null, false);

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.createReport(request, "unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(reportRepository, never()).save(any());
    }

    @Test
    @DisplayName("getReportById - exists - returns report")
    void getReportById_exists() {
        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));

        ReportResponse response = reportService.getReportById(TEST_REPORT_ID);

        assertThat(response.getId()).isEqualTo(TEST_REPORT_ID);
        assertThat(response.getPhotoUrl()).isEqualTo(TEST_PHOTO_URL);
    }

    @Test
    @DisplayName("getReportById - not found - throws ResourceNotFoundException")
    void getReportById_notFound() {
        UUID unknownId = UUID.randomUUID();
        when(reportRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.getReportById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Report not found");
    }

    @Test
    @DisplayName("getReports - no filters - returns all paginated")
    void getReports_noFilters() {
        Page<Report> page = new PageImpl<>(List.of(testReport));
        when(reportRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<ReportResponse> result = reportService.getReports(null, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCategory()).isEqualTo(ReportCategory.ILLEGAL_DUMPING);
    }

    @Test
    @DisplayName("getReports - filter by status - returns filtered")
    void getReports_filterByStatus() {
        Page<Report> page = new PageImpl<>(List.of(testReport));
        when(reportRepository.findByStatus(ReportStatus.REPORTED, PageRequest.of(0, 20))).thenReturn(page);

        Page<ReportResponse> result = reportService.getReports(ReportStatus.REPORTED, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        verify(reportRepository).findByStatus(ReportStatus.REPORTED, PageRequest.of(0, 20));
    }

    @Test
    @DisplayName("getMyReports - returns user reports only")
    void getMyReports_success() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(reportRepository.findByReporterId(TEST_USER_ID)).thenReturn(List.of(testReport));

        List<ReportResponse> result = reportService.getMyReports(TEST_EMAIL);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReporterId()).isEqualTo(TEST_USER_ID);
    }
}
