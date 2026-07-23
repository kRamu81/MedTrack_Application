package com.medtrack.auth.mfa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for verifying a 6-digit TOTP code or emergency recovery code during MFA authentication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Verification code or recovery code is required")
    private String code;
}
