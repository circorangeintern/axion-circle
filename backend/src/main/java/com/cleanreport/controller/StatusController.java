package com.cleanreport.controller;

import com.cleanreport.dto.request.UpdateStatusRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.StatusHistoryResponse;
import com.cleanreport.service.StatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports/{reportId}/status")
@RequiredArgsConstructor
@Tag(name = "Status Management", description = "Update report status (admin only) and view status history (public)")
public class StatusController {

    private final StatusService statusService;

    @Operation(
            summary = "Update report status (Admin only)",
            description = """
                    Transitions a report to a new status. Only forward transitions allowed:
                    REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
                    
                    Attempting to go backward (e.g., RESOLVED → REPORTED) returns 400.
                    Each change is recorded in status history with who changed it and optional note.
                    
                    **Requires ADMIN role.**
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid transition (backward) or validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not an admin"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found")
    })
    @PutMapping
    public ResponseEntity<ApiResponse<StatusHistoryResponse>> updateStatus(
            @Parameter(description = "Report UUID") @PathVariable UUID reportId,
            @Valid @RequestBody UpdateStatusRequest request,
            Authentication authentication) {
        StatusHistoryResponse response = statusService.updateStatus(reportId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(
            summary = "Get status history for a report",
            description = """
                    Returns the full timeline of status changes for a report.
                    Sorted newest first. Includes who made each change, the note, and timestamp.
                    
                    **Public endpoint — no auth required.**
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status history returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<StatusHistoryResponse>>> getStatusHistory(
            @Parameter(description = "Report UUID") @PathVariable UUID reportId) {
        List<StatusHistoryResponse> history = statusService.getHistory(reportId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
