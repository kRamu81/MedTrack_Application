package com.medtrack.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Concrete implementation of EmailService that supports sending real emails via SMTP
 * if configured, with a graceful console log fallback if mail infrastructure is unavailable.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Autowired
    public EmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtp(String to, String otp) {
        log.info("Preparing to send password reset OTP: [{}] to email: [{}]", otp, to);
        if (mailSender == null) {
            log.warn("SMTP JavaMailSender is not configured. Falling back to console logging.");
            log.info("[CONSOLE FALLBACK] Password reset OTP is: [{}] for email: [{}]", otp, to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@medtrack.com");
            message.setTo(to);
            message.setSubject("MedTrack Password Reset OTP");
            message.setText("Your MedTrack password reset OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes.");
            mailSender.send(message);
            log.info("Successfully sent OTP email to: [{}]", to);
        } catch (Exception e) {
            log.error("Failed to send email via SMTP. Error: {}", e.getMessage(), e);
            log.info("[FALLBACK CONSOLE LOG] Password reset OTP is: [{}] for email: [{}]", otp, to);
        }
    }
}
