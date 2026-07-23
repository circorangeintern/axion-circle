package com.cleanreport.service;

import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Notification;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.NotificationRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * In-app notification system + email notifications.
 * Creates a notification record (in-app) and optionally sends an email via EmailService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Create in-app notification for a user.
     */
    @Transactional
    public Notification createNotification(User user, Report report, String type, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .report(report)
                .type(type)
                .title(title)
                .message(message)
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * Notify reporter that their report status changed + send email.
     */
    @Transactional
    public void notifyStatusChange(Report report, String oldStatus, String newStatus) {
        User reporter = report.getReporter();
        String title = "Report " + report.getReferenceNumber() + " updated";
        String message = String.format("Your report status changed from %s to %s", oldStatus, newStatus);

        createNotification(reporter, report, "STATUS_CHANGE", title, message);

        // Also send email notification
        String htmlBody = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1B5E20;">CleanReport</h2>
                    <p>Hi %s,</p>
                    <p>Your report <strong>%s</strong> has been updated:</p>
                    <p style="font-size: 18px;">%s → <strong>%s</strong></p>
                    <p>%s</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">CleanReport — Report It. Track It. Clean It.</p>
                </div>
                """, reporter.getDisplayName(), report.getReferenceNumber(), oldStatus, newStatus,
                report.getTitle() != null ? report.getTitle() : "");

        emailService.sendEmail(reporter.getEmail(), title, htmlBody);
        log.info("Status notification sent to {} for report {}", reporter.getEmail(), report.getReferenceNumber());
    }

    /**
     * Get user's notifications (paginated, newest first).
     */
    public Page<Notification> getMyNotifications(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return notificationRepository.findByUserIdOrderBySentAtDesc(user.getId(), pageable);
    }

    /**
     * Get unread count.
     */
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    /**
     * Mark all as read.
     */
    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        notificationRepository.markAllAsRead(user.getId());
    }

    /**
     * Mark a single notification as read.
     */
    @Transactional
    public void markAsRead(String email, java.util.UUID notificationId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        notificationRepository.markAsRead(notificationId, user.getId());
    }
}

// (appended to existing file)
