package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User credit balance")
public class CreditBalanceResponse {

    private UUID userId;
    private String displayName;

    @Schema(description = "Current credit balance (₦1 per credit)", example = "85")
    private Integer balance;
}
