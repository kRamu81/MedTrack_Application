package com.medtrack.auth.keyvault.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing metadata for generated cryptographic keys stored in KeyVault.
 */
@Entity
@Table(name = "crypto_key_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoKeyMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String keyId; // e.g., KID-AES-2026-001

    @Column(nullable = false)
    private String keyAlias;

    @Column(nullable = false)
    private String algorithm; // AES-256-GCM, RSA-4096, ECC-P384

    @Column(nullable = false)
    private String keyType; // SYMMETRIC, ASYMMETRIC, SIGNING

    @Column(nullable = false)
    private String state; // ACTIVE, ROTATED, REVOKED, EXPIRED

    @Column(nullable = false)
    private int version;

    @Column(nullable = false)
    private LocalDateTime activatedAt;

    private LocalDateTime expiresAt;

    private LocalDateTime revokedAt;
}
