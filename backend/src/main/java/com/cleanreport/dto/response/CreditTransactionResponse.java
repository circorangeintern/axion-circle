package com.cleanreport.dto.response;

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
@Schema(description = "Credit transaction history entry")
public class CreditTransactionResponse {

    private UUID id;

    @Schema(description = "Credits earned (positive) or spent (negative)", example = "10")
    private Integer amount;

    @Schema(description = "Reason for the transaction", example = "Report submitted: CR-88251")
    private String reason;

    @Schema(description = "Related report ID (if applicable)")
    private UUID reportId;

    @Schema(description = "When the transaction occurred")
    private Instant createdAt;
}
