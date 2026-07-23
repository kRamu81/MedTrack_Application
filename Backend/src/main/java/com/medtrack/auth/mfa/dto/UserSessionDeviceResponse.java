package com.medtrack.auth.mfa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing an active user device session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDeviceResponse {

    private Long id;
    private Long userId;
    private String deviceId;
    private String deviceName;
    private String ipAddress;
    private String location;
    private String userAgent;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastAccessedAt;
}
