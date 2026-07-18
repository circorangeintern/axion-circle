package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create/update saved filter request")
public class SavedFilterRequest {

    @NotBlank(message = "Filter name is required")
    @Size(max = 100, message = "Name must be 100 characters or less")
    @Schema(description = "User-friendly name for this filter", example = "My area - urgent only")
    private String name;

    @Schema(description = "Categories to filter", example = "[\"OVERFLOW\", \"BLOCKED_DRAIN\"]")
    private List<String> categories;

    @Schema(description = "Urgency levels to filter", example = "[\"VERY_URGENT\", \"CRITICAL\"]")
    private List<String> urgencyLevels;

    @Schema(description = "Statuses to filter", example = "[\"REPORTED\", \"IN_PROGRESS\"]")
    private List<String> statuses;

    @Schema(description = "Area name filter", example = "Lagos Island")
    private String areaName;
}
