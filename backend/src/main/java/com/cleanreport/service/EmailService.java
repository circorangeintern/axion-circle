package com.cleanreport.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Properties;
import jakarta.mail.*;
import jakarta.mail.internet.*;

/**
 * Email sending service using Gmail SMTP.
 * Sends FROM the project Gmail account through Google's own servers.
 * 100% deliverability — no shared IPs, no third-party rate limiting.
 * 500 emails/day limit.
 *
 * Requires:
 * - GMAIL_USER: cleanreport6@gmail.com
 * - GMAIL_APP_PASSWORD: 16-char app password (2FA required)
 */
@Slf4j
@Service
public class EmailService {

    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final int SMTP_PORT = 587;

    private String getGmailUser() {
        String user = System.getenv("GMAIL_USER");
        return (user != null && !user.isBlank()) ? user : null;
    }

    private String getGmailPassword() {
        String pwd = System.getenv("GMAIL_APP_PASSWORD");
        return (pwd != null && !pwd.isBlank()) ? pwd : null;
    }

    /**
     * Send an email via Gmail SMTP. NEVER throws — email failure must not block business logic.
     */
    public boolean sendEmail(String to, String subject, String htmlBody) {
        String gmailUser = getGmailUser();
        String gmailPassword = getGmailPassword();

        if (gmailUser == null || gmailPassword == null) {
            log.info("[EMAIL-DEV] No GMAIL credentials set. To: {} | Subject: {}", to, subject);
            return true;
        }

        try {
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", SMTP_HOST);
            props.put("mail.smtp.port", String.valueOf(SMTP_PORT));
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");

            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(gmailUser, gmailPassword);
                }
            });

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(gmailUser, "CleanReport"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject);
            message.setContent(htmlBody, "text/html; charset=utf-8");

            Transport.send(message);
            log.info("Email sent to {} via Gmail SMTP", to);
            return true;
        } catch (Exception e) {
            log.warn("Email send failed (non-blocking) to {}: {}", to, e.getMessage());
            return false;
        }
    }

    public boolean sendVerificationEmail(String to, String displayName, String code) {
        String subject = "CleanReport — Verify your email";
        String html = "<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;'>"
                + "<h2 style='color: #1B5E20;'>CleanReport</h2>"
                + "<p>Hi " + escapeHtml(displayName) + ",</p>"
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
                + "<p>Hi " + escapeHtml(displayName) + ",</p>"
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

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
