package com.medtrack.auth.mfa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Enterprise JPA entity tracking active user device sessions, IP address geolocation context,
 * user-agent strings, and active device revocation status.
 */
@Entity
@Table(name = "user_session_devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String deviceId; // Unique device fingerprint ID

    private String deviceName; // e.g. Chrome on Windows 11, Safari on iOS

    private String ipAddress;

    private String location; // Estimated city / region

    private String userAgent;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime lastAccessedAt;

    private LocalDateTime revokedAt;
}
