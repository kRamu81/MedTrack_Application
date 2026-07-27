package com.medtrack.auth.evidence.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking immutable compliance audit evidence items.
 */
@Entity
@Table(name = "compliance_evidence_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceEvidenceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String evidenceId; // e.g., EVD-99201

    @Column(nullable = false)
    private String frameworkStandard; // SOC2, HIPAA, ISO27001

    @Column(nullable = false)
    private String controlReference; // CC6.1, HIPAA-164.312

    @Column(nullable = false)
    private String evidenceType; // LOG_EXPORT, ACCESS_MATRIX, AUDIT_TRAIL_DUMP

    @Column(nullable = false, length = 128)
    private String fileHashSha256;

    @Column(nullable = false)
    private String storageUri; // s3://medtrack-evidence-vault/soc2/2026/evd-99201.log

    @Column(nullable = false)
    private String verificationStatus; // VERIFIED, UNVERIFIED, EXPIRED

    @Column(nullable = false)
    private String ingestedBy; // AUDIT_SENSOR, AUDITOR_SARAH

    @Column(length = 1500)
    private String evidenceDescription;

    @Column(nullable = false)
    private LocalDateTime ingestedAt;
}
