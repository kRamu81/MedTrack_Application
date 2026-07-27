package com.medtrack.auth.posture.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking individual posture control assessments across security domains.
 */
@Entity
@Table(name = "posture_control_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostureControlAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String controlId; // e.g., CIS-1.1, NIST-AC-2

    @Column(nullable = false)
    private String controlName;

    @Column(nullable = false)
    private String domainCategory; // IAM_GOVERNANCE, ENCRYPTION_HEALTH, NETWORK_PERIMETER, VULNERABILITY_HEALTH

    @Column(nullable = false)
    private String complianceStatus; // COMPLIANT, NON_COMPLIANT, NEEDS_REMEDIATION

    @Column(length = 1500)
    private String evidenceDetails;

    private String evaluationId;

    @Column(nullable = false)
    private LocalDateTime assessedAt;
}
