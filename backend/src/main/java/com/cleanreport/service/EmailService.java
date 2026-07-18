package com.cleanreport.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Email sending service using Resend.
 * Reads RESEND_API_KEY from environment at send time.
 * NEVER throws — email failure must not block business logic (registration, password reset).
 */
@Slf4j
@Service
public class EmailService {

    private static final String FROM_ADDRESS = "CleanReport <onboarding@resend.dev>";

    private String getApiKey() {
        String key = System.getenv("RESEND_API_KEY");
        return (key != null && !key.isBlank()) ? key : null;
    }

    /**
     * Send an email. NEVER throws. Returns false on any failure.
     */
    public boolean sendEmail(String to, String subject, String htmlBody) {
        String apiKey = getApiKey();

        if (apiKey == null) {
            log.info("[EMAIL-DEV] No RESEND_API_KEY set. To: {} | Subject: {}", to, subject);
            return true;
        }

        try {
            Resend resend = new Resend(apiKey);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(FROM_ADDRESS)
                    .to(to)
                    .subject(subject)
                    .html(htmlBody)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Email sent to {} via Resend (id: {})", to, response.getId());
            return true;
        } catch (Exception e) {
            // NEVER propagate — email failure must not block registration/password reset
            log.warn("Email send failed (non-blocking) to {}: {}", to, e.getMessage());
            return false;
        }
    }

    public boolean sendVerificationEmail(String to, String displayName, String code) {
        String subject = "CleanReport — Verify your email";
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1B5E20;">CleanReport</h2>
                    <p>Hi %s,</p>
                    <p>Your verification code is:</p>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1B5E20;">%s</span>
                    </div>
                    <p>This code expires in <strong>10 minutes</strong>.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
                """, displayName, code);
        return sendEmail(to, subject, html);
    }

    public boolean sendPasswordResetEmail(String to, String displayName, String resetToken) {
        String subject = "CleanReport — Reset your password";
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1B5E20;">CleanReport</h2>
                    <p>Hi %s,</p>
                    <p>Your password reset token:</p>
                    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <code style="font-size: 14px; word-break: break-all;">%s</code>
                    </div>
                    <p>This token expires in <strong>15 minutes</strong>.</p>
                </div>
                """, displayName, resetToken);
        return sendEmail(to, subject, html);
    }
}
