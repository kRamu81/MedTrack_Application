package com.medtrack.auth.scim.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking SCIM 2.0 external IdP user mappings.
 */
@Entity
@Table(name = "scim_user_mappings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimUserMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String scimExternalId; // IdP User ID (e.g., okta-user-99102)

    @Column(nullable = false)
    private String medtrackUsername;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String enterpriseIdpProvider; // OKTA, AZURE_AD, PING_IDENTITY

    @Column(nullable = false)
    private String assignedRole; // HOSPITAL_ADMIN, TECHNICIAN, SUPPLIER

    @Column(nullable = false)
    private String syncStatus; // PROVISIONED, DEPROVISIONED, SUSPENDED

    @Column(nullable = false)
    private LocalDateTime lastSyncedAt;
}
