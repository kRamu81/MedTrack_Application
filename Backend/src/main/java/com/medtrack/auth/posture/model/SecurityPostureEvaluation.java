package com.medtrack.auth.posture.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking security posture evaluation audit runs.
 */
@Entity
@Table(name = "security_posture_evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPostureEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String evaluationId; // e.g., POS-2026-8801

    @Column(nullable = false)
    private String benchmarkStandard; // CIS_BENCHMARK, NIST_800_53, ISO_27001

    @Column(nullable = false)
    private double overallPostureScore; // 0.0 to 100.0%

    @Column(nullable = false)
    private String riskRating; // LOW_RISK, MEDIUM_RISK, HIGH_RISK, OPTIMAL

    @Column(nullable = false)
    private int evaluatedControlsCount;

    @Column(nullable = false)
    private int compliantControlsCount;

    @Column(nullable = false)
    private String evaluatedBy;

    @Column(length = 1500)
    private String evaluationSummary;

    @Column(nullable = false)
    private LocalDateTime evaluationTimestamp;
}
