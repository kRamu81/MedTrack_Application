package com.medtrack.auth.service;

/**
 * EmailService provides contract methods for sending emails, such as OTP codes for password resets.
 */
public interface EmailService {

    /**
     * Sends a numeric OTP code to the specified recipient.
     *
     * @param to the recipient's email address
     * @param otp the generated OTP code
     */
    void sendOtp(String to, String otp);
}
