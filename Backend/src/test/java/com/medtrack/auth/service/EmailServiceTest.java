package com.medtrack.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    void sendOtp_WithMailSender_Success() {
        EmailServiceImpl emailService = new EmailServiceImpl(mailSender);
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> emailService.sendOtp("test@example.com", "123456"));

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendOtp_WithMailSender_Failure_SwallowsException() {
        EmailServiceImpl emailService = new EmailServiceImpl(mailSender);
        doThrow(new RuntimeException("SMTP Server down")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> emailService.sendOtp("test@example.com", "123456"));

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendOtp_WithoutMailSender_FallbackToLog() {
        EmailServiceImpl emailService = new EmailServiceImpl(null);

        assertDoesNotThrow(() -> emailService.sendOtp("test@example.com", "123456"));
    }
}
