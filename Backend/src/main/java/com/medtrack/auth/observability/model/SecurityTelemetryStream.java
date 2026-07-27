package com.medtrack.auth.observability.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking real-time security log and event telemetry streams.
 */
@Entity
@Table(name = "security_telemetry_streams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityTelemetryStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String streamId; // e.g., STRM-88091

    @Column(nullable = false)
    private String streamSource; // AUTHENTICATION_SERVICE, ZERO_TRUST_PROXY, KEY_VAULT

    @Column(nullable = false)
    private String eventType; // ACCESS_GRANTED, ACCESS_DENIED, SUSPICIOUS_IP_BURST

    @Column(nullable = false)
    private long payloadSizeBytes;

    @Column(nullable = false)
    private double throughputMbps;

    @Column(nullable = false)
    private String streamStatus; // ACTIVE, PAUSED, DEGRADED

    @Column(length = 1500)
    private String traceMetadata;

    @Column(nullable = false)
    private LocalDateTime lastStreamedAt;
}
