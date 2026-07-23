package com.medtrack.auth.mfa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO returning the current MFA configuration status for a user account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaStatusResponse {

    private Long userId;
    private boolean mfaEnabled;
    private LocalDateTime enabledAt;
    private LocalDateTime lastVerifiedAt;
    private int activeDeviceCount;
    private String message;
}
