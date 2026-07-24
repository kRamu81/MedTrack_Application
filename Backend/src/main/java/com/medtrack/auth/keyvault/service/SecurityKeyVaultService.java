package com.medtrack.auth.keyvault.service;

import com.medtrack.auth.keyvault.dto.*;
import com.medtrack.auth.keyvault.model.*;
import com.medtrack.auth.keyvault.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Cryptographic Key Generation, Key Vault Policies,
 * Automated Key Rotation, Revocation, and Hardware Security Module (HSM) Governance.
 */
@Service
@RequiredArgsConstructor
public class SecurityKeyVaultService {

    private final SecurityKeyVaultPolicyRepository policyRepository;
    private final CryptoKeyMetadataRepository keyMetadataRepository;
    private final KeyVaultAuditLogRepository auditLogRepository;

    private static final String DEFAULT_POLICY_NAME = "MASTER_KEY_VAULT_POLICY";

    /**
     * Seeds initial KeyVault policy and master encryption key.
     */
    @PostConstruct
    @Transactional
    public void seedMasterKeyVault() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            SecurityKeyVaultPolicy policy = SecurityKeyVaultPolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .keyRotationDays(90)
                    .defaultAlgorithm("AES-256-GCM")
                    .autoRotationEnabled(true)
                    .hardwareSecurityModuleEnabled(true)
                    .exportKeysAllowed(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        if (keyMetadataRepository.findByKeyAlias("MASTER-DATA-ENCRYPTION-KEY").isEmpty()) {
            generateCryptoKey(GenerateKeyRequest.builder()
                    .keyAlias("MASTER-DATA-ENCRYPTION-KEY")
                    .algorithm("AES-256-GCM")
                    .keyType("SYMMETRIC")
                    .build());
        }
    }

    /**
     * Retrieves current active Key Vault security policy.
     */
    @Transactional(readOnly = true)
    public KeyVaultPolicyResponse getActivePolicy() {
        SecurityKeyVaultPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates Key Vault security policy parameters.
     */
    @Transactional
    public KeyVaultPolicyResponse updatePolicy(KeyVaultPolicyUpdateRequest request) {
        SecurityKeyVaultPolicy policy = getOrCreatePolicy();
        policy.setKeyRotationDays(request.getKeyRotationDays());
        policy.setDefaultAlgorithm(request.getDefaultAlgorithm());
        policy.setAutoRotationEnabled(request.isAutoRotationEnabled());
        policy.setHardwareSecurityModuleEnabled(request.isHardwareSecurityModuleEnabled());
        policy.setExportKeysAllowed(request.isExportKeysAllowed());
        policy.setUpdatedAt(LocalDateTime.now());

        SecurityKeyVaultPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Generates a new cryptographic key and registers metadata in Key Vault.
     */
    @Transactional
    public CryptoKeyResponse generateCryptoKey(GenerateKeyRequest request) {
        SecurityKeyVaultPolicy policy = getOrCreatePolicy();
        String kid = "KID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        CryptoKeyMetadata metadata = CryptoKeyMetadata.builder()
                .keyId(kid)
                .keyAlias(request.getKeyAlias())
                .algorithm(request.getAlgorithm() != null ? request.getAlgorithm() : policy.getDefaultAlgorithm())
                .keyType(request.getKeyType() != null ? request.getKeyType() : "SYMMETRIC")
                .state("ACTIVE")
                .version(1)
                .activatedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(policy.getKeyRotationDays()))
                .build();

        CryptoKeyMetadata saved = keyMetadataRepository.save(metadata);

        auditLogRepository.save(KeyVaultAuditLog.builder()
                .keyId(saved.getKeyId())
                .operation("KEY_GENERATE")
                .actorUsername("SYSTEM_ADMIN")
                .ipAddress("127.0.0.1")
                .status("SUCCESS")
                .details("Generated new " + saved.getAlgorithm() + " key with alias " + saved.getKeyAlias())
                .timestamp(LocalDateTime.now())
                .build());

        return mapToKeyResponse(saved);
    }

    /**
     * Rotates an active key creating a new version.
     */
    @Transactional
    public CryptoKeyResponse rotateKey(String keyId) {
        CryptoKeyMetadata existing = keyMetadataRepository.findByKeyId(keyId)
                .orElseThrow(() -> new IllegalArgumentException("Crypto key not found: " + keyId));

        existing.setState("ROTATED");
        keyMetadataRepository.save(existing);

        SecurityKeyVaultPolicy policy = getOrCreatePolicy();
        String newKid = "KID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        CryptoKeyMetadata newVersion = CryptoKeyMetadata.builder()
                .keyId(newKid)
                .keyAlias(existing.getKeyAlias())
                .algorithm(existing.getAlgorithm())
                .keyType(existing.getKeyType())
                .state("ACTIVE")
                .version(existing.getVersion() + 1)
                .activatedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(policy.getKeyRotationDays()))
                .build();

        CryptoKeyMetadata saved = keyMetadataRepository.save(newVersion);

        auditLogRepository.save(KeyVaultAuditLog.builder()
                .keyId(saved.getKeyId())
                .operation("KEY_ROTATE")
                .actorUsername("SYSTEM_ADMIN")
                .ipAddress("127.0.0.1")
                .status("SUCCESS")
                .details("Rotated key alias " + existing.getKeyAlias() + " to version " + saved.getVersion())
                .timestamp(LocalDateTime.now())
                .build());

        return mapToKeyResponse(saved);
    }

    /**
     * Revokes a key permanently.
     */
    @Transactional
    public CryptoKeyResponse revokeKey(String keyId) {
        CryptoKeyMetadata key = keyMetadataRepository.findByKeyId(keyId)
                .orElseThrow(() -> new IllegalArgumentException("Crypto key not found: " + keyId));

        key.setState("REVOKED");
        key.setRevokedAt(LocalDateTime.now());

        CryptoKeyMetadata saved = keyMetadataRepository.save(key);

        auditLogRepository.save(KeyVaultAuditLog.builder()
                .keyId(saved.getKeyId())
                .operation("KEY_REVOKE")
                .actorUsername("SYSTEM_ADMIN")
                .ipAddress("127.0.0.1")
                .status("SUCCESS")
                .details("Revoked cryptographic key ID " + keyId)
                .timestamp(LocalDateTime.now())
                .build());

        return mapToKeyResponse(saved);
    }

    /**
     * Retrieves all cryptographic key metadata.
     */
    @Transactional(readOnly = true)
    public List<CryptoKeyResponse> getAllKeys() {
        return keyMetadataRepository.findAll().stream()
                .map(this::mapToKeyResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all Key Vault audit logs.
     */
    @Transactional(readOnly = true)
    public List<KeyVaultAuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(log -> KeyVaultAuditLogResponse.builder()
                        .id(log.getId())
                        .keyId(log.getKeyId())
                        .operation(log.getOperation())
                        .actorUsername(log.getActorUsername())
                        .ipAddress(log.getIpAddress())
                        .status(log.getStatus())
                        .details(log.getDetails())
                        .timestamp(log.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    private SecurityKeyVaultPolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(SecurityKeyVaultPolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .keyRotationDays(90)
                        .defaultAlgorithm("AES-256-GCM")
                        .autoRotationEnabled(true)
                        .hardwareSecurityModuleEnabled(true)
                        .exportKeysAllowed(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private KeyVaultPolicyResponse mapToPolicyResponse(SecurityKeyVaultPolicy policy) {
        return KeyVaultPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .keyRotationDays(policy.getKeyRotationDays())
                .defaultAlgorithm(policy.getDefaultAlgorithm())
                .autoRotationEnabled(policy.isAutoRotationEnabled())
                .hardwareSecurityModuleEnabled(policy.isHardwareSecurityModuleEnabled())
                .exportKeysAllowed(policy.isExportKeysAllowed())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private CryptoKeyResponse mapToKeyResponse(CryptoKeyMetadata key) {
        return CryptoKeyResponse.builder()
                .id(key.getId())
                .keyId(key.getKeyId())
                .keyAlias(key.getKeyAlias())
                .algorithm(key.getAlgorithm())
                .keyType(key.getKeyType())
                .state(key.getState())
                .version(key.getVersion())
                .activatedAt(key.getActivatedAt())
                .expiresAt(key.getExpiresAt())
                .revokedAt(key.getRevokedAt())
                .build();
    }
}
