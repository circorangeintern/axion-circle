package com.cleanreport.dto.request;

import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportUrgency;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Report submission request")
public class CreateReportRequest {

    @NotNull(message = "Photo URL is required")
    @Schema(description = "Cloudinary URL of uploaded photo", example = "https://res.cloudinary.com/xxx/image/upload/v1/reports/abc123.jpg")
    private String photoUrl;

    @NotNull(message = "Latitude is required")
    @Schema(description = "GPS latitude", example = "6.5244")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Schema(description = "GPS longitude", example = "3.3792")
    private Double longitude;

    @NotNull(message = "Category is required")
    @Schema(description = "Issue category", example = "ILLEGAL_DUMPING")
    private ReportCategory category;

    @Size(max = 200, message = "Description must be 200 characters or less")
    @Schema(description = "Short description of the issue", example = "Large pile of waste near the school gate")
    private String description;

    @Schema(description = "Urgency level", example = "ROUTINE")
    private ReportUrgency urgency;

    @Schema(description = "Submit anonymously", example = "false")
    private Boolean isAnonymous;
}
