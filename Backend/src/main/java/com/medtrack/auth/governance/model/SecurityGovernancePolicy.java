package com.medtrack.auth.governance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing security governance and compliance configuration settings.
 */
@Entity
@Table(name = "security_governance_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityGovernancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private boolean hipaaComplianceEnabled;

    @Column(nullable = false)
    private boolean soc2ComplianceEnabled;

    @Column(nullable = false)
    private boolean gdprComplianceEnabled;

    @Column(nullable = false)
    private int passwordRotationDays;

    @Column(nullable = false)
    private int sessionTimeoutMinutes;

    @Column(nullable = false)
    private int auditLogRetentionDays;

    @Column(nullable = false)
    private boolean strictMfaRequired;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
