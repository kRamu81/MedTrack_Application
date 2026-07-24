package com.medtrack.auth.compliance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing regulatory compliance standards (SOC2, HIPAA, GDPR, ISO27001) and evidence retention rules.
 */
@Entity
@Table(name = "compliance_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompliancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private String activeFramework; // SOC2_TYPE2, HIPAA_HITECH, GDPR_ARTICLE32, ISO_27001

    @Column(nullable = false)
    private int dataRetentionDays;

    @Column(nullable = false)
    private boolean autoAuditScheduled;

    @Column(nullable = false)
    private boolean enforceStrictEvidenceLogs;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
