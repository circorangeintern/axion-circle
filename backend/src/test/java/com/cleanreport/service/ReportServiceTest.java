package com.cleanreport.service;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.DashboardStatsResponse;
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
import static org.mockito.ArgumentMatchers.eq;
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
    @Mock
    private GeocodingService geocodingService;
    @Mock
    private CreditService creditService;

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
                .title("Overflowing bin near school")
                .photoUrl(TEST_PHOTO_URL)
                .location(point)
                .description("Test waste report")
                .address("15 Broad Street, Lagos Island")
                .category(ReportCategory.ILLEGAL_DUMPING)
                .status(ReportStatus.REPORTED)
                .urgency(ReportUrgency.ROUTINE)
                .isAnonymous(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("createReport - success with title and auto-geocoded address")
    void createReport_success() {
        CreateReportRequest request = new CreateReportRequest();
        request.setTitle("Overflowing bin");
        request.setPhotoUrl(TEST_PHOTO_URL);
        request.setLatitude(TEST_LATITUDE);
        request.setLongitude(TEST_LONGITUDE);
        request.setCategory(ReportCategory.ILLEGAL_DUMPING);
        request.setDescription("Waste near school");
        request.setUrgency(ReportUrgency.VERY_URGENT);
        request.setIsAnonymous(false);

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(geocodingService.reverseGeocode(TEST_LATITUDE, TEST_LONGITUDE)).thenReturn("15 Broad Street, Lagos");
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        ReportResponse response = reportService.createReport(request, TEST_EMAIL);

        assertThat(response.getId()).isEqualTo(TEST_REPORT_ID);
        assertThat(response.getReferenceNumber()).startsWith("CR-");
        assertThat(response.getCategory()).isEqualTo(ReportCategory.ILLEGAL_DUMPING);
        assertThat(response.getStatus()).isEqualTo(ReportStatus.REPORTED);
        assertThat(response.getReporterName()).isEqualTo(TEST_DISPLAY_NAME);
        assertThat(response.getTitle()).isEqualTo("Overflowing bin near school");
        assertThat(response.getAddress()).isEqualTo("15 Broad Street, Lagos Island");

        verify(reportRepository).save(any(Report.class));
        verify(geocodingService).reverseGeocode(TEST_LATITUDE, TEST_LONGITUDE);
    }

    @Test
    @DisplayName("createReport - with manual address skips geocoding")
    void createReport_manualAddress_skipsGeocoding() {
        CreateReportRequest request = new CreateReportRequest();
        request.setPhotoUrl(TEST_PHOTO_URL);
        request.setLatitude(TEST_LATITUDE);
        request.setLongitude(TEST_LONGITUDE);
        request.setCategory(ReportCategory.STREET_LITTER);
        request.setAddress("Manually entered address");

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        reportService.createReport(request, TEST_EMAIL);

        verify(geocodingService, never()).reverseGeocode(anyDouble(), anyDouble());
    }

    @Test
    @DisplayName("createReport - anonymous - hides reporter name")
    void createReport_anonymous_hidesName() {
        testReport = testReport.toBuilder().isAnonymous(true).build();
        CreateReportRequest request = new CreateReportRequest();
        request.setPhotoUrl(TEST_PHOTO_URL);
        request.setLatitude(TEST_LATITUDE);
        request.setLongitude(TEST_LONGITUDE);
        request.setCategory(ReportCategory.OVERFLOW);
        request.setIsAnonymous(true);

        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(geocodingService.reverseGeocode(TEST_LATITUDE, TEST_LONGITUDE)).thenReturn(null);
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        ReportResponse response = reportService.createReport(request, TEST_EMAIL);

        assertThat(response.getReporterName()).isEqualTo("Anonymous");
        assertThat(response.getIsAnonymous()).isTrue();
    }

    @Test
    @DisplayName("createReport - unknown user - throws ResourceNotFoundException")
    void createReport_unknownUser_throwsNotFound() {
        CreateReportRequest request = new CreateReportRequest();
        request.setPhotoUrl(TEST_PHOTO_URL);
        request.setLatitude(TEST_LATITUDE);
        request.setLongitude(TEST_LONGITUDE);
        request.setCategory(ReportCategory.BLOCKED_DRAIN);

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.createReport(request, "unknown@example.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(reportRepository, never()).save(any());
    }

    @Test
    @DisplayName("getReportById - exists - returns report with new fields")
    void getReportById_exists() {
        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));

        ReportResponse response = reportService.getReportById(TEST_REPORT_ID);

        assertThat(response.getId()).isEqualTo(TEST_REPORT_ID);
        assertThat(response.getPhotoUrl()).isEqualTo(TEST_PHOTO_URL);
        assertThat(response.getTitle()).isEqualTo("Overflowing bin near school");
        assertThat(response.getAddress()).isEqualTo("15 Broad Street, Lagos Island");
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
    @DisplayName("getReports - filter by new category STREET_LITTER")
    void getReports_filterByNewCategory() {
        testReport = testReport.toBuilder().category(ReportCategory.STREET_LITTER).build();
        Page<Report> page = new PageImpl<>(List.of(testReport));
        when(reportRepository.findByCategory(ReportCategory.STREET_LITTER, PageRequest.of(0, 20))).thenReturn(page);

        Page<ReportResponse> result = reportService.getReports(null, ReportCategory.STREET_LITTER, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCategory()).isEqualTo(ReportCategory.STREET_LITTER);
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

    @Test
    @DisplayName("searchReports - returns matching results")
    void searchReports_returnsMatches() {
        Page<Report> page = new PageImpl<>(List.of(testReport));
        when(reportRepository.searchByKeyword(eq("drainage"), any(PageRequest.class))).thenReturn(page);

        Page<ReportResponse> result = reportService.searchReports("drainage", PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        verify(reportRepository).searchByKeyword(eq("drainage"), any(PageRequest.class));
    }

    @Test
    @DisplayName("getDashboardStats - returns correct totals")
    void getDashboardStats_returnsTotals() {
        when(reportRepository.count()).thenReturn(100L);
        when(reportRepository.countByStatus(ReportStatus.REPORTED)).thenReturn(30L);
        when(reportRepository.countByStatus(ReportStatus.ACKNOWLEDGED)).thenReturn(20L);
        when(reportRepository.countByStatus(ReportStatus.IN_PROGRESS)).thenReturn(10L);
        when(reportRepository.countByStatus(ReportStatus.RESOLVED)).thenReturn(40L);
        when(reportRepository.countByCategory(any(ReportCategory.class))).thenReturn(15L);
        when(userRepository.count()).thenReturn(25L);

        DashboardStatsResponse stats = reportService.getDashboardStats();

        assertThat(stats.getTotalReports()).isEqualTo(100L);
        assertThat(stats.getResolvedReports()).isEqualTo(40L);
        assertThat(stats.getPendingReports()).isEqualTo(60L);
        assertThat(stats.getTotalUsers()).isEqualTo(25L);
        assertThat(stats.getTotalCreditsEarned()).isEqualTo(1000L);
        assertThat(stats.getByStatus()).containsEntry("REPORTED", 30L);
        assertThat(stats.getByStatus()).containsEntry("RESOLVED", 40L);
        assertThat(stats.getByCategory()).hasSize(6);
    }
}
