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
            return ResponseEntity.ok(Map.of("status", "no_credentials", 
                "gmail_user", String.valueOf(gmailUser),
                "gmail_pass_length", String.valueOf(gmailPassword != null ? gmailPassword.length() : 0)));
        }

        try {
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
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
            message.setSubject("CleanReport SMTP Test");
            message.setContent("<h2>Gmail SMTP works!</h2><p>This email confirms delivery.</p>", "text/html; charset=utf-8");

            Transport.send(message);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "to", to, "from", gmailUser));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "SMTP_ERROR",
                "error_class", e.getClass().getSimpleName(),
                "error_message", e.getMessage() != null ? e.getMessage() : "null",
                "gmail_user", gmailUser,
                "gmail_pass_length", String.valueOf(gmailPassword.length())
            ));
        }
    }
}
