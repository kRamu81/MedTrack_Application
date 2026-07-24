package com.medtrack.auth.governance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing an individual security compliance control rule (e.g. HIPAA, SOC2, GDPR).
 */
@Entity
@Table(name = "security_compliance_controls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityComplianceControl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String controlCode;

    @Column(nullable = false)
    private String controlName;

    @Column(nullable = false)
    private String framework; // HIPAA, SOC2, GDPR, ISO27001

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean passed;

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private LocalDateTime lastEvaluatedAt;
}
