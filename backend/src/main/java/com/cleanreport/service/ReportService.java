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
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import com.cleanreport.util.ReferenceNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final int SRID_WGS84 = 4326;

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final CreditService creditService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), SRID_WGS84);

    @Transactional
    public ReportResponse createReport(CreateReportRequest request, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reporterEmail));

        Point location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        location.setSRID(SRID_WGS84);

        // Auto-fill address via reverse geocoding if not provided
        String address = request.getAddress();
        if (address == null || address.isBlank()) {
            address = geocodingService.reverseGeocode(request.getLatitude(), request.getLongitude());
        }

        Report report = Report.builder()
                .referenceNumber(ReferenceNumberGenerator.generate())
                .reporter(reporter)
                .title(request.getTitle())
                .photoUrl(request.getPhotoUrl())
                .location(location)
                .description(request.getDescription())
                .address(address)
                .category(request.getCategory())
                .status(ReportStatus.REPORTED)
                .urgency(request.getUrgency() != null ? request.getUrgency() : ReportUrgency.ROUTINE)
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();

        Report saved = reportRepository.save(report);
        log.info("Report created: {} by user {}", saved.getReferenceNumber(), reporter.getEmail());

        // Award credits for report submission
        creditService.awardReportSubmitCredits(reporter, saved);

        return mapToResponse(saved);
    }

    public ReportResponse getReportById(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
        return mapToResponse(report);
    }

    public Page<ReportResponse> getReports(ReportStatus status, ReportCategory category, Pageable pageable) {
        Page<Report> reports;

        if (status != null && category != null) {
            reports = reportRepository.findByStatusAndCategory(status, category, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else if (category != null) {
            reports = reportRepository.findByCategory(category, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }

        return reports.map(this::mapToResponse);
    }

    public List<ReportResponse> getNearbyReports(double lat, double lng, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        return reportRepository.findNearby(lat, lng, radiusMeters)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReportResponse> getMyReports(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return reportRepository.findByReporterId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Full-text search across report title, description, and address.
     */
    public Page<ReportResponse> searchReports(String keyword, Pageable pageable) {
        return reportRepository.searchByKeyword(keyword, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Dashboard statistics: totals by status and category.
     */
    public DashboardStatsResponse getDashboardStats() {
        long total = reportRepository.count();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ReportStatus status : ReportStatus.values()) {
            byStatus.put(status.name(), reportRepository.countByStatus(status));
        }

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (ReportCategory category : ReportCategory.values()) {
            byCategory.put(category.name(), reportRepository.countByCategory(category));
        }

        long resolved = byStatus.getOrDefault("RESOLVED", 0L);
        long pending = total - resolved;

        long totalUsers = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalReports(total)
                .resolvedReports(resolved)
                .pendingReports(pending)
                .byStatus(byStatus)
                .byCategory(byCategory)
                .totalCreditsEarned(total * 10) // Each report = 10 credits
                .totalUsers(totalUsers)
                .build();
    }

    private ReportResponse mapToResponse(Report report) {
        String reporterName = report.getIsAnonymous() ? "Anonymous" : report.getReporter().getDisplayName();

        return ReportResponse.builder()
                .id(report.getId())
                .referenceNumber(report.getReferenceNumber())
                .reporterId(report.getReporter().getId())
                .reporterName(reporterName)
                .title(report.getTitle())
                .photoUrl(report.getPhotoUrl())
                .photoAfterUrl(report.getPhotoAfterUrl())
                .latitude(report.getLocation().getY())
                .longitude(report.getLocation().getX())
                .description(report.getDescription())
                .address(report.getAddress())
                .category(report.getCategory())
                .status(report.getStatus())
                .urgency(report.getUrgency())
                .isAnonymous(report.getIsAnonymous())
                .areaName(report.getAreaName())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
