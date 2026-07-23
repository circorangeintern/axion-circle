package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.model.entity.Notification;
import com.cleanreport.service.NotificationService;
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

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification system")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get my notifications", description = "Paginated, newest first.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            Authentication authentication,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        Page<Notification> notifications = notificationService.getMyNotifications(
                authentication.getName(), PageRequest.of(page, Math.min(size, 50)));
        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }

    @Operation(summary = "Get unread notification count",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }

    @Operation(summary = "Mark all notifications as read",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/mark-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "All notifications marked as read"));
    }

    @Operation(summary = "Mark a single notification as read",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markOneAsRead(
            @PathVariable java.util.UUID notificationId,
            Authentication authentication) {
        notificationService.markAsRead(authentication.getName(), notificationId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
