package com.medtrack.auth.compliance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing regulatory compliance audit evaluation reports.
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

    @Column(nullable = false, unique = true)
    private String reportId; // e.g., AUD-2026-9901

    @Column(nullable = false)
    private String frameworkStandard; // SOC2_TYPE2, HIPAA_HITECH, GDPR_ARTICLE32, ISO_27001

    @Column(nullable = false)
    private double complianceScorePercentage; // 0.0 to 100.0%

    @Column(nullable = false)
    private String status; // PASS, FAIL, WARNING

    @Column(nullable = false)
    private int totalControlsEvaluated;

    @Column(nullable = false)
    private int passedControlsCount;

    @Column(nullable = false)
    private String evaluatedBy;

    @Column(length = 1500)
    private String executiveSummary;

    @Column(nullable = false)
    private LocalDateTime auditDate;
}
