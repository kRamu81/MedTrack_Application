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

    /**
     * Sends a supplier commercial invoice to the hospital admin as a PDF attachment.
     *
     * @param to the hospital admin email address
     * @param orderCode the code of the equipment order
     * @param pdfAttachment the generated PDF binary data
     */
    void sendInvoiceEmail(String to, String orderCode, byte[] pdfAttachment);
}

