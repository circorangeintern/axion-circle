package com.cleanreport.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Properties;
import jakarta.mail.*;
import jakarta.mail.internet.*;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class EmailTestController {

    @GetMapping("/email-test")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String to) {
        String gmailUser = System.getenv("GMAIL_USER");
        String gmailPassword = System.getenv("GMAIL_APP_PASSWORD");

        if (gmailUser == null || gmailPassword == null) {
            return ResponseEntity.ok(Map.of("status", "no_credentials"));
        }

        try {
            // Use port 465 with SSL (port 587 STARTTLS is blocked on Render)
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "465");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");

            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(gmailUser, gmailPassword);
                }
            });

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(gmailUser, "CleanReport"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("CleanReport SMTP Test (Port 465)");
            message.setContent("<h2 style='color:#1B5E20'>CleanReport</h2><p>Gmail SMTP via port 465 works!</p>", "text/html; charset=utf-8");

            Transport.send(message);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "to", to, "port", "465"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "SMTP_ERROR",
                "error_class", e.getClass().getSimpleName(),
                "error_message", e.getMessage() != null ? e.getMessage() : "null",
                "port", "465"
            ));
        }
    }
}
