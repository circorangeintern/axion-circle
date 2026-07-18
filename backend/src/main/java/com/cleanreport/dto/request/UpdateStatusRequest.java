package com.cleanreport.dto.request;

import com.cleanreport.model.enums.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Status update request")
public class UpdateStatusRequest {

    @NotNull(message = "New status is required")
    @Schema(description = "New status to transition to", example = "ACKNOWLEDGED",
            allowableValues = {"ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"})
    private ReportStatus status;

    @Size(max = 500, message = "Note must be 500 characters or less")
    @Schema(description = "Optional note explaining the status change", example = "Dispatch team has been notified")
    private String note;
}
