package com.cleanreport.controller;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report submission and retrieval")
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Submit a new report", description = "Creates a sanitation issue report with photo and GPS location")
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication) {
        ReportResponse response = reportService.createReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Report submitted successfully"));
    }

    @Operation(summary = "List reports", description = "Get paginated list of reports with optional filters")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @Parameter(description = "Filter by status") @RequestParam(required = false) ReportStatus status,
            @Parameter(description = "Filter by category") @RequestParam(required = false) ReportCategory category,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> reports = reportService.getReports(status, category,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(summary = "Get report by ID", description = "Get full details of a single report")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(@PathVariable UUID id) {
        ReportResponse response = reportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Get nearby reports", description = "Find reports within a radius of given coordinates")
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getNearbyReports(
            @Parameter(description = "Latitude", required = true) @RequestParam double lat,
            @Parameter(description = "Longitude", required = true) @RequestParam double lng,
            @Parameter(description = "Radius in km") @RequestParam(defaultValue = "5") double radius) {
        List<ReportResponse> reports = reportService.getNearbyReports(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(summary = "Get my reports", description = "Get all reports submitted by the authenticated user")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(Authentication authentication) {
        List<ReportResponse> reports = reportService.getMyReports(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }
}
