package com.cleanreport.dto.response;

import com.cleanreport.model.enums.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Status history entry")
public class StatusHistoryResponse {

    private UUID id;

    @Schema(description = "Who made the change")
    private String changedByName;

    @Schema(description = "User ID of who changed it")
    private UUID changedById;

    @Schema(description = "Previous status (null for initial report)")
    private ReportStatus oldStatus;

    @Schema(description = "New status after change")
    private ReportStatus newStatus;

    @Schema(description = "Note explaining the change")
    private String note;

    @Schema(description = "When the change happened")
    private Instant createdAt;
}
