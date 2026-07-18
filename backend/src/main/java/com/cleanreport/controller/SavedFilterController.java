package com.cleanreport.controller;

import com.cleanreport.dto.request.SavedFilterRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.model.entity.SavedFilter;
import com.cleanreport.service.SavedFilterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/filters")
@RequiredArgsConstructor
@Tag(name = "Saved Filters", description = "Save, list, and delete custom report filter presets")
public class SavedFilterController {

    private final SavedFilterService savedFilterService;

    @Operation(summary = "Save a filter preset", description = "Save filter configuration for quick access. Max 10 per user.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping
    public ResponseEntity<ApiResponse<SavedFilter>> createFilter(
            @Valid @RequestBody SavedFilterRequest request,
            Authentication authentication) {
        SavedFilter filter = savedFilterService.createFilter(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(filter, "Filter saved successfully"));
    }

    @Operation(summary = "Get my saved filters", description = "List all saved filter presets for the current user.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedFilter>>> getMyFilters(Authentication authentication) {
        List<SavedFilter> filters = savedFilterService.getMyFilters(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(filters));
    }

    @Operation(summary = "Delete a saved filter", description = "Remove a saved filter preset. Only owner can delete.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @DeleteMapping("/{filterId}")
    public ResponseEntity<ApiResponse<Void>> deleteFilter(
            @Parameter(description = "Filter UUID") @PathVariable UUID filterId,
            Authentication authentication) {
        savedFilterService.deleteFilter(filterId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "Filter deleted"));
    }
}
