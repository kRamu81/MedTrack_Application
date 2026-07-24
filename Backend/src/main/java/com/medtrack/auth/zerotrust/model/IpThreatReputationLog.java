package com.medtrack.auth.zerotrust.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity logging IP address threat intelligence and reputation metrics.
 */
@Entity
@Table(name = "ip_threat_reputation_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpThreatReputationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ipAddress;

    private String countryCode;

    @Column(nullable = false)
    private int failedAttemptsCount;

    @Column(nullable = false)
    private int threatScore; // 0 to 100

    @Column(nullable = false)
    private String threatLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private boolean blocked;

    private LocalDateTime blockedUntil;

    @Column(nullable = false)
    private LocalDateTime lastSeenAt;
}
