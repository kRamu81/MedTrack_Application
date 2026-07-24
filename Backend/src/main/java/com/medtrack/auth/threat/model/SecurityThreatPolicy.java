package com.medtrack.auth.threat.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing security threat detection sensitivity and SOAR containment rules.
 */
@Entity
@Table(name = "security_threat_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityThreatPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private int maxFailedLoginsPerMinute;

    @Column(nullable = false)
    private int anomalyRiskThreshold; // 0 to 100 risk score trigger

    @Column(nullable = false)
    private boolean autoContainmentEnabled; // Auto-execute IP ban/lockout

    @Column(nullable = false)
    private boolean notifySecurityOperationsCenter;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
