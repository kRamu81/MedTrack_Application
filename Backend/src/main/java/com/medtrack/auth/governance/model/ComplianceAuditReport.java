package com.medtrack.auth.governance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity logging historical security compliance audit scans and health scores.
 */
@Entity
@Table(name = "compliance_audit_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceAuditReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String scanTitle;

    @Column(nullable = false)
    private int complianceScore; // 0 to 100

    @Column(nullable = false)
    private int totalControlsEvaluated;

    @Column(nullable = false)
    private int passedControlsCount;

    @Column(nullable = false)
    private int failedControlsCount;

    @Column(nullable = false)
    private String overallStatus; // COMPLIANT, WARNING, NON_COMPLIANT

    @Column(length = 2000)
    private String summaryDetails;

    @Column(nullable = false)
    private LocalDateTime scannedAt;
}
