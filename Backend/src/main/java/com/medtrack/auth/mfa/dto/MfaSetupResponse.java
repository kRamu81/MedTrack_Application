package com.medtrack.auth.mfa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO returned when initiating Multi-Factor Authentication (MFA) setup.
 * Contains the generated TOTP secret key, QR Code Base64 URI, and emergency recovery backup codes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupResponse {

    private Long userId;
    private String secretKey;
    private String qrCodeUrl;
    private String otpAuthUri;
    private List<String> recoveryCodes;
    private String message;
}
