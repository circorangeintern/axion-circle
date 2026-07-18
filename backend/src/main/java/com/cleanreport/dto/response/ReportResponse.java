package com.cleanreport.dto.response;

import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.model.enums.ReportUrgency;
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
@Schema(description = "Report response")
public class ReportResponse {

    private UUID id;
    private String referenceNumber;
    private UUID reporterId;
    private String reporterName;
    private String title;
    private String photoUrl;
    private String photoAfterUrl;
    private Double latitude;
    private Double longitude;
    private String description;
    private String address;
    private ReportCategory category;
    private ReportStatus status;
    private ReportUrgency urgency;
    private Boolean isAnonymous;
    private String areaName;
    private Instant createdAt;
    private Instant updatedAt;
}
