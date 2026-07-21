package com.cleanreport.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Email sending service using SendGrid.
 * Reads SENDGRID_API_KEY from environment at send time.
 * SendGrid free tier: 100 emails/day to ANY recipient (no domain verification needed).
 * Falls back to logging if key not configured.
 */
@Slf4j
@Service
public class EmailService {

    private static final String FROM_EMAIL = "noreply@cleanreport.app";
    private static final String FROM_NAME = "CleanReport";

    private String getApiKey() {
        String key = System.getenv("SENDGRID_API_KEY");
        return (key != null && !key.isBlank()) ? key : null;
    }

    /**
     * Send an email via SendGrid. NEVER throws — email failure must not block business logic.
     */
    public boolean sendEmail(String to, String subject, String htmlBody) {
        String apiKey = getApiKey();

        if (apiKey == null) {
            log.info("[EMAIL-DEV] No SENDGRID_API_KEY set. To: {} | Subject: {}", to, subject);
            return true;
        }

        try {
            Email from = new Email(FROM_EMAIL, FROM_NAME);
            Email toEmail = new Email(to);
            Content content = new Content("text/html", htmlBody);
            Mail mail = new Mail(from, subject, toEmail, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Email sent to {} via SendGrid (status: {})", to, response.getStatusCode());
                return true;
            } else {
                log.warn("SendGrid returned {} for {}: {}", response.getStatusCode(), to, response.getBody());
                return false;
            }
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
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">CleanReport — Report It. Track It. Clean It.</p>
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
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">CleanReport — Report It. Track It. Clean It.</p>
                </div>
                """, displayName, resetToken);
        return sendEmail(to, subject, html);
    }
}
