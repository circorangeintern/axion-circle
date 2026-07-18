package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.CreditTransactionResponse;
import com.cleanreport.service.CreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/credits")
@RequiredArgsConstructor
@Tag(name = "Credits", description = "View credit balance and transaction history. Credits earned from report submissions and resolutions.")
public class CreditController {

    private final CreditService creditService;

    @Operation(
            summary = "Get my credit balance",
            description = "Returns the current credit balance for the authenticated user. Each credit = ₦1 value.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<CreditBalanceResponse>> getBalance(Authentication authentication) {
        CreditBalanceResponse balance = creditService.getBalance(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(balance));
    }

    @Operation(
            summary = "Get credit transaction history",
            description = """
                    Returns paginated list of all credit transactions for the authenticated user.
                    Sorted newest first. Shows amount, reason, related report, and timestamp.
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<CreditTransactionResponse>>> getHistory(
            Authentication authentication,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Page<CreditTransactionResponse> history = creditService.getHistory(
                authentication.getName(), PageRequest.of(page, Math.min(size, 100)));
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
