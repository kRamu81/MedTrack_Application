package com.medtrack.auth.keyvault.controller;

import com.medtrack.auth.keyvault.dto.*;
import com.medtrack.auth.keyvault.service.SecurityKeyVaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Key Vault Cryptographic Governance & Hardware Security Module (HSM) Management.
 */
@RestController
@RequestMapping("/api/auth/keyvault")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Key Vault Security Governance", description = "APIs for cryptographic key lifecycle management, rotation, and vault policies.")
public class SecurityKeyVaultController {

    private final SecurityKeyVaultService keyVaultService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Key Vault Policy", description = "Retrieves active cryptographic key rotation policy settings.")
    public ResponseEntity<KeyVaultPolicyResponse> getActivePolicy() {
        KeyVaultPolicyResponse policy = keyVaultService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Key Vault Policy", description = "Updates cryptographic algorithm and rotation policies.")
    public ResponseEntity<KeyVaultPolicyResponse> updatePolicy(@Valid @RequestBody KeyVaultPolicyUpdateRequest request) {
        KeyVaultPolicyResponse updated = keyVaultService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/keys")
    @Operation(summary = "Generate Cryptographic Key", description = "Generates a new cryptographic key and registers metadata in Key Vault.")
    public ResponseEntity<CryptoKeyResponse> generateCryptoKey(@Valid @RequestBody GenerateKeyRequest request) {
        CryptoKeyResponse created = keyVaultService.generateCryptoKey(request);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/keys/{keyId}/rotate")
    @Operation(summary = "Rotate Cryptographic Key", description = "Rotates an active key creating a new version.")
    public ResponseEntity<CryptoKeyResponse> rotateKey(@PathVariable String keyId) {
        CryptoKeyResponse rotated = keyVaultService.rotateKey(keyId);
        return ResponseEntity.ok(rotated);
    }

    @PostMapping("/keys/{keyId}/revoke")
    @Operation(summary = "Revoke Cryptographic Key", description = "Revokes a key permanently.")
    public ResponseEntity<CryptoKeyResponse> revokeKey(@PathVariable String keyId) {
        CryptoKeyResponse revoked = keyVaultService.revokeKey(keyId);
        return ResponseEntity.ok(revoked);
    }

    @GetMapping("/keys")
    @Operation(summary = "Get All Cryptographic Keys", description = "Retrieves metadata for all registered Key Vault keys.")
    public ResponseEntity<List<CryptoKeyResponse>> getAllKeys() {
        List<CryptoKeyResponse> keys = keyVaultService.getAllKeys();
        return ResponseEntity.ok(keys);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get Key Vault Audit Logs", description = "Retrieves historical key access and lifecycle audit events.")
    public ResponseEntity<List<KeyVaultAuditLogResponse>> getAllAuditLogs() {
        List<KeyVaultAuditLogResponse> logs = keyVaultService.getAllAuditLogs();
        return ResponseEntity.ok(logs);
    }
}
