package com.medtrack.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Concrete placeholder implementation of EmailService.
 * Prints the OTP to the console logs as email infrastructure is currently unavailable.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendOtp(String to, String otp) {
        log.info("Sending password reset OTP: [{}] to email: [{}]", otp, to);
    }
}
