package com.medtrack.auth.scim.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing SCIM 2.0 Identity Federation & Automated User Provisioning policies.
 */
@Entity
@Table(name = "scim_provisioning_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimProvisioningPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private String primaryIdpProvider; // OKTA, AZURE_AD, PING_IDENTITY, ONELOGIN

    @Column(nullable = false)
    private String defaultDeprovisionAction; // SUSPEND, SOFT_DELETE, ANONYMIZE

    @Column(nullable = false)
    private boolean autoSyncEnabled;

    @Column(nullable = false)
    private boolean enforceRoleMapping;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
