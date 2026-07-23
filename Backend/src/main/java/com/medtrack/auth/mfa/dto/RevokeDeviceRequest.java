package com.medtrack.auth.mfa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for revoking an active user device session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevokeDeviceRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Device ID or Session ID is required")
    private String deviceId;

    private String reason;
}
