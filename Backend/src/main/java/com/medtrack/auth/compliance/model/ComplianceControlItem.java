package com.medtrack.auth.compliance.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing granular security compliance control evidence items.
 */
@Entity
@Table(name = "compliance_control_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceControlItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String controlCode; // e.g. SOC2-CC6.1, HIPAA-164.312(a)(1)

    @Column(nullable = false)
    private String controlName;

    @Column(nullable = false)
    private String framework; // SOC2_TYPE2, HIPAA_HITECH, GDPR_ARTICLE32, ISO_27001

    @Column(nullable = false)
    private String status; // COMPLIANT, NON_COMPLIANT, PARTIAL

    @Column(length = 1500)
    private String evidenceDetails;

    private String reportId;

    @Column(nullable = false)
    private LocalDateTime evaluatedAt;
}
