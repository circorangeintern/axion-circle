package com.cleanreport.dto.request;

import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportUrgency;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Report submission request")
public class CreateReportRequest {

    @NotBlank(message = "Photo URL is required")
    @Schema(description = "Cloudinary URL of uploaded photo", example = "https://res.cloudinary.com/xxx/image/upload/v1/reports/abc123.jpg")
    private String photoUrl;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Schema(description = "GPS latitude (-90 to 90)", example = "6.5244")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Schema(description = "GPS longitude (-180 to 180)", example = "3.3792")
    private Double longitude;

    @NotNull(message = "Category is required")
    @Schema(description = "Issue category", example = "ILLEGAL_DUMPING")
    private ReportCategory category;

    @Size(max = 200, message = "Description must be 200 characters or less")
    @Schema(description = "Short description of the issue (max 200 chars)", example = "Large pile of waste near the school gate")
    private String description;

    @Schema(description = "Urgency level (defaults to ROUTINE if not provided)", example = "ROUTINE")
    private ReportUrgency urgency;

    @Schema(description = "Submit anonymously (hides reporter name)", example = "false")
    private Boolean isAnonymous;
}
