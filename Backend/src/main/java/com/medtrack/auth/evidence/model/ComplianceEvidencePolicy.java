package com.medtrack.auth.evidence.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing enterprise Compliance Evidence Vault policy rules.
 */
@Entity
@Table(name = "compliance_evidence_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceEvidencePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName; // e.g., MASTER_EVIDENCE_POLICY

    @Column(nullable = false)
    private String defaultFrameworkStandard; // SOC2, HIPAA, GDPR, ISO27001

    @Column(nullable = false)
    private String hashAlgorithm; // SHA-256, SHA-512

    @Column(nullable = false)
    private boolean wormStorageEnabled; // Write Once Read Many Immutability

    @Column(nullable = false)
    private int retentionYears; // 7 years for HIPAA/SOC2

    @Column(nullable = false)
    private boolean autoChainVerificationEnabled;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
