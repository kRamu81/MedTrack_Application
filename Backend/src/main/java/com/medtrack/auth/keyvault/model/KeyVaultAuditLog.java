package com.medtrack.auth.keyvault.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity logging access and operational lifecycle events for KeyVault cryptographic keys.
 */
@Entity
@Table(name = "key_vault_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyVaultAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyId;

    @Column(nullable = false)
    private String operation; // KEY_GENERATE, KEY_ROTATE, KEY_REVOKE, KEY_ACCESS

    private String actorUsername;

    private String ipAddress;

    @Column(nullable = false)
    private String status; // SUCCESS, DENIED, FAILED

    @Column(length = 1000)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
