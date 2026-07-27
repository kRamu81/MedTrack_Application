package com.medtrack.auth.posture.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing enterprise Security Posture benchmarks and threshold policies.
 */
@Entity
@Table(name = "security_posture_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPosturePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private String activeBenchmarkStandard; // CIS_BENCHMARK, NIST_800_53, ISO_27001, HIPAA_SECURITY_RULE

    @Column(nullable = false)
    private double minimumScoreThreshold; // Minimum acceptable posture score (0.0 - 100.0)

    @Column(nullable = false)
    private boolean automatedAssessmentEnabled;

    @Column(nullable = false)
    private boolean notifyRiskThresholdBreaches;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
