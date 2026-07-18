package com.cleanreport.controller;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.DashboardStatsResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@Tag(name = "Reports", description = "Submit sanitation issue reports, search, view stats, filter by status/category/location.")
public class ReportController {

    private final ReportService reportService;

    @Operation(
            summary = "Submit a new report",
            description = """
                    Creates a sanitation issue report. Requires authentication (Bearer token).
                    
                    **Flow:**
                    1. Frontend uploads photo to Cloudinary → gets photoUrl
                    2. Frontend captures GPS coordinates from browser
                    3. User selects category and optionally adds title + description
                    4. Submit this endpoint with all data
                    5. If no address provided, reverse geocoding auto-fills it from coordinates
                    
                    **Credits:** Reporter earns +10 credits on successful submission.
                    
                    **Reference number:** A unique CR-XXXXX number is generated for tracking.
                    
                    **Categories:** OVERFLOW, ILLEGAL_DUMPING, BLOCKED_DRAIN, STREET_LITTER, RESIDENTIAL_DUMP, COMMERCIAL_DUMP
                    
                    **Urgency levels:** ROUTINE (default), VERY_URGENT, CRITICAL
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Report created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error (missing photo, category, or coordinates)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated — include Bearer token in Authorization header")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication) {
        ReportResponse response = reportService.createReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Report submitted successfully"));
    }

    @Operation(
            summary = "List reports (paginated, filterable)",
            description = """
                    Returns a paginated list of all reports. **Public endpoint — no auth required.**
                    
                    **Filters:**
                    - `status`: REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED
                    - `category`: OVERFLOW, ILLEGAL_DUMPING, BLOCKED_DRAIN, STREET_LITTER, RESIDENTIAL_DUMP, COMMERCIAL_DUMP
                    
                    **Pagination:**
                    - `page`: 0-based page number (default: 0)
                    - `size`: items per page (default: 20, max: 100)
                    
                    **Sorting:** Always newest first (createdAt DESC).
                    """)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @Parameter(description = "Filter by status", example = "REPORTED")
            @RequestParam(required = false) ReportStatus status,
            @Parameter(description = "Filter by category", example = "ILLEGAL_DUMPING")
            @RequestParam(required = false) ReportCategory category,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page (max 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> reports = reportService.getReports(status, category,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(
            summary = "Search reports by keyword",
            description = """
                    Full-text search across report title, description, and address.
                    Uses PostgreSQL's `to_tsvector` for efficient text matching.
                    **Public endpoint — no auth required.**
                    
                    **Example:** `/reports/search?q=drainage&page=0&size=10`
                    """)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> searchReports(
            @Parameter(description = "Search keyword", required = true, example = "drainage")
            @RequestParam("q") String keyword,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page (max 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> results = reportService.searchReports(keyword,
                PageRequest.of(page, Math.min(size, 100)));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @Operation(
            summary = "Get dashboard statistics",
            description = """
                    Returns aggregated statistics for the dashboard:
                    - Total reports count
                    - Resolved vs pending count
                    - Breakdown by status
                    - Breakdown by category
                    - Total community credits earned
                    - Total registered users
                    
                    **Public endpoint — no auth required.**
                    """)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @Operation(
            summary = "Get report by ID",
            description = """
                    Returns full details of a single report including reporter name
                    (or "Anonymous" if submitted anonymously), photo URL, GPS coordinates,
                    title, address, status, and timestamps. **Public endpoint.**
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Report not found: 550e8400-e29b-41d4-a716-446655440000","errors":null,"timestamp":"2026-07-13T12:00:00Z"}
                            """)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(
            @Parameter(description = "Report UUID", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {
        ReportResponse response = reportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(
            summary = "Find reports near a location",
            description = """
                    Returns all reports within a given radius of GPS coordinates.
                    Uses PostGIS geospatial query. **Public endpoint.**
                    
                    **Example:** `/reports/nearby?lat=6.5244&lng=3.3792&radius=5`
                    → all reports within 5km of Lekki, Lagos.
                    """)
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getNearbyReports(
            @Parameter(description = "Latitude of center point", required = true, example = "6.5244")
            @RequestParam double lat,
            @Parameter(description = "Longitude of center point", required = true, example = "3.3792")
            @RequestParam double lng,
            @Parameter(description = "Search radius in kilometers", example = "5")
            @RequestParam(defaultValue = "5") double radius) {
        List<ReportResponse> reports = reportService.getNearbyReports(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(
            summary = "Get my reports",
            description = """
                    Returns all reports submitted by the currently authenticated user.
                    Requires Bearer token. Sorted newest first.
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of user's reports"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(Authentication authentication) {
        List<ReportResponse> reports = reportService.getMyReports(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }
}
