package com.medtrack.auth.zerotrust.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing zero-trust security configuration policy settings.
 */
@Entity
@Table(name = "zero_trust_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZeroTrustPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private boolean ipWhitelistEnabled;

    @Column(nullable = false)
    private boolean geoFencingEnabled;

    @Column(nullable = false)
    private int maxFailedAttemptsThreshold;

    @Column(nullable = false)
    private int ipBlockDurationMinutes;

    @Column(nullable = false)
    private boolean anomalyDetectionEnabled;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
