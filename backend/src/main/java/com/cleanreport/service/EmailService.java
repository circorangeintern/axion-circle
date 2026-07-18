package com.cleanreport.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Email sending service using Resend.
 * Falls back to logging if RESEND_API_KEY is not configured.
 */
@Slf4j
@Service
public class EmailService {

    private static final String DEFAULT_FROM = "CleanReport <noreply@cleanreport.app>";

    @Value("${app.email.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.email.from:CleanReport <onboarding@resend.dev>}")
    private String fromAddress;

    /**
     * Send an email. Returns true if sent successfully (or logged in dev mode).
     */
    public boolean sendEmail(String to, String subject, String htmlBody) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.info("[EMAIL-DEV] To: {} | Subject: {} | Body preview: {}",
                    to, subject, htmlBody.substring(0, Math.min(100, htmlBody.length())));
            return true;
        }

        try {
            Resend resend = new Resend(resendApiKey);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromAddress)
                    .to(to)
                    .subject(subject)
                    .html(htmlBody)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Email sent to {} via Resend (id: {})", to, response.getId());
            return true;
        } catch (ResendException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    /**
     * Send verification OTP code.
     */
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
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">CleanReport — Report It. Track It. Clean It.</p>
                </div>
                """, displayName, code);

        return sendEmail(to, subject, html);
    }

    /**
     * Send password reset email.
     */
    public boolean sendPasswordResetEmail(String to, String displayName, String resetToken) {
        String subject = "CleanReport — Reset your password";
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1B5E20;">CleanReport</h2>
                    <p>Hi %s,</p>
                    <p>We received a request to reset your password. Use this token:</p>
                    <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <code style="font-size: 14px; word-break: break-all;">%s</code>
                    </div>
                    <p>This token expires in <strong>15 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">CleanReport — Report It. Track It. Clean It.</p>
                </div>
                """, displayName, resetToken);

        return sendEmail(to, subject, html);
    }
}
