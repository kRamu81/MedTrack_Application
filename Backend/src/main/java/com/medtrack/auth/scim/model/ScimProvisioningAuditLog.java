package com.medtrack.auth.scim.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity auditing SCIM 2.0 provisioning and lifecycle sync operations.
 */
@Entity
@Table(name = "scim_provisioning_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimProvisioningAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String scimExternalId;

    @Column(nullable = false)
    private String actionType; // USER_CREATED, USER_UPDATED, USER_DEPROVISIONED, ROLE_SYNCHRONIZED

    @Column(nullable = false)
    private String executedBy; // SCIM_CONNECTOR, ENTERPRISE_ADMIN

    @Column(nullable = false)
    private String status; // EXECUTED, FAILED

    @Column(length = 1000)
    private String auditDetails;

    @Column(nullable = false)
    private LocalDateTime executedAt;
}
