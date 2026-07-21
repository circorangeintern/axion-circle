package com.cleanreport.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Email sending service using Brevo (formerly Sendinblue).
 * Brevo free tier: 300 emails/day to ANY recipient, no domain verification needed.
 * Just needs a verified sender email and API key.
 *
 * API: POST https://api.brevo.com/v3/smtp/email
 * Auth: api-key header
 */
@Slf4j
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String SENDER_EMAIL = "boutchouangelija@gmail.com";
    private static final String SENDER_NAME = "CleanReport";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private String getApiKey() {
        String key = System.getenv("BREVO_API_KEY");
        return (key != null && !key.isBlank()) ? key : null;
    }

    /**
     * Send an email via Brevo. NEVER throws — email failure must not block business logic.
     */
    public boolean sendEmail(String to, String subject, String htmlBody) {
        String apiKey = getApiKey();

        if (apiKey == null) {
            log.info("[EMAIL-DEV] No BREVO_API_KEY set. To: {} | Subject: {}", to, subject);
            return true;
        }

        try {
            // Escape quotes in HTML for JSON embedding
            String escapedHtml = htmlBody.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");

            String jsonBody = String.format("""
                    {"sender":{"name":"%s","email":"%s"},"to":[{"email":"%s"}],"subject":"%s","htmlContent":"%s"}""",
                    SENDER_NAME, SENDER_EMAIL, to, subject.replace("\"", "\\\""), escapedHtml);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent to {} via Brevo (status: {})", to, response.statusCode());
                return true;
            } else {
                log.warn("Brevo returned {} for {}: {}", response.statusCode(), to, response.body());
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
        String html = "<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;'>"
                + "<h2 style='color: #1B5E20;'>CleanReport</h2>"
                + "<p>Hi " + displayName + ",</p>"
                + "<p>Your verification code is:</p>"
                + "<div style='background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;'>"
                + "<span style='font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1B5E20;'>" + code + "</span>"
                + "</div>"
                + "<p>This code expires in <strong>10 minutes</strong>.</p>"
                + "<p>If you didn't create an account, please ignore this email.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<p style='color: #999; font-size: 12px;'>CleanReport — Report It. Track It. Clean It.</p>"
                + "</div>";
        return sendEmail(to, subject, html);
    }

    public boolean sendPasswordResetEmail(String to, String displayName, String resetToken) {
        String subject = "CleanReport — Reset your password";
        String html = "<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;'>"
                + "<h2 style='color: #1B5E20;'>CleanReport</h2>"
                + "<p>Hi " + displayName + ",</p>"
                + "<p>Your password reset token:</p>"
                + "<div style='background: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>"
                + "<code style='font-size: 14px; word-break: break-all;'>" + resetToken + "</code>"
                + "</div>"
                + "<p>This token expires in <strong>15 minutes</strong>.</p>"
                + "<p>If you didn't request this, please ignore this email.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "<p style='color: #999; font-size: 12px;'>CleanReport — Report It. Track It. Clean It.</p>"
                + "</div>";
        return sendEmail(to, subject, html);
    }
}
