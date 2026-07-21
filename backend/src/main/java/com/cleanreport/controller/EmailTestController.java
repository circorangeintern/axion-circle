package com.cleanreport.controller;

import com.cleanreport.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @GetMapping("/email-test")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam String to) {
        try {
            boolean sent = emailService.sendEmail(to, "CleanReport Email Test", 
                "<h2>Email Test</h2><p>If you see this, Gmail SMTP is working!</p>");
            return ResponseEntity.ok(Map.of("status", sent ? "sent" : "failed_silently", "to", to));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "error", "error", e.getMessage(), "to", to));
        }
    }
}
