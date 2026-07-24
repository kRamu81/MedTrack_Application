package com.medtrack.auth.threat.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing detected security incidents (e.g. BRUTE_FORCE, EXFILTRATION, ANOMALOUS_GEO).
 */
@Entity
@Table(name = "security_threat_incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityThreatIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String incidentId; // e.g., INC-2026-8801

    @Column(nullable = false)
    private String threatType; // BRUTE_FORCE, ANOMALOUS_GEOLOCATION, PRIVILEGE_ESCALATION, DATA_EXFILTRATION

    @Column(nullable = false)
    private String threatLevel; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(nullable = false)
    private int riskScore; // 0 to 100

    private String sourceIp;

    private String targetUsername;

    @Column(nullable = false)
    private String status; // DETECTED, INVESTIGATING, CONTAINED, RESOLVED, FALSE_POSITIVE

    @Column(length = 1500)
    private String incidentDetails;

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    private LocalDateTime resolvedAt;
}
