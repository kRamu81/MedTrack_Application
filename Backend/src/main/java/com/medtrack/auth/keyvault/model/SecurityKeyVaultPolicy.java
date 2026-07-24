package com.medtrack.auth.keyvault.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing cryptographic key vault policy settings and rotation standards.
 */
@Entity
@Table(name = "security_key_vault_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityKeyVaultPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private int keyRotationDays;

    @Column(nullable = false)
    private String defaultAlgorithm; // AES-256-GCM, RSA-4096, ECC-P384

    @Column(nullable = false)
    private boolean autoRotationEnabled;

    @Column(nullable = false)
    private boolean hardwareSecurityModuleEnabled;

    @Column(nullable = false)
    private boolean exportKeysAllowed;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
