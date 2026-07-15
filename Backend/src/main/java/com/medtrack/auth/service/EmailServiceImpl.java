package com.medtrack.auth.service;

import com.medtrack.auth.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;

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

    @Override
    public void sendInvoiceEmail(String to, String orderCode, byte[] pdfAttachment) {
        log.info("Preparing to send supplier commercial invoice for order: [{}] to email: [{}]", orderCode, to);
        if (mailSender == null) {
            log.warn("SMTP JavaMailSender is not configured. Falling back to console logging.");
            log.info("[CONSOLE FALLBACK] Invoice [{}] sent to [{}]. PDF Attachment size: {} bytes. Base64 Preview: {}",
                    orderCode, to, pdfAttachment.length, Base64.getEncoder().encodeToString(pdfAttachment).substring(0, Math.min(100, pdfAttachment.length)) + "...");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("billing@medtrack.com");
            helper.setTo(to);
            helper.setSubject("MedTrack Commercial Invoice - " + orderCode);
            helper.setText("Dear Customer,\n\nPlease find attached the commercial invoice for your equipment order " + orderCode + ".\n\nThank you for choosing MedTrack Logistics.\n\nBest Regards,\nSupplier Fulfillment Team");

            helper.addAttachment("invoice-" + orderCode + ".pdf", new ByteArrayResource(pdfAttachment));

            mailSender.send(message);
            log.info("Successfully sent invoice email for order: [{}] to: [{}]", orderCode, to);
        } catch (Exception e) {
            log.error("Failed to send invoice email via SMTP. Error: {}", e.getMessage(), e);
            log.info("[FALLBACK CONSOLE LOG] Invoice [{}] sent to [{}]. PDF Attachment size: {} bytes",
                    orderCode, to, pdfAttachment.length);
        }
    }
}

