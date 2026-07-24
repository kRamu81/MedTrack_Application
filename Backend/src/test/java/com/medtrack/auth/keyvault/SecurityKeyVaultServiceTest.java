package com.medtrack.auth.keyvault;

import com.medtrack.auth.keyvault.dto.*;
import com.medtrack.auth.keyvault.model.*;
import com.medtrack.auth.keyvault.repository.*;
import com.medtrack.auth.keyvault.service.SecurityKeyVaultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SecurityKeyVaultService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityKeyVaultServiceTest {

    @Mock
    private SecurityKeyVaultPolicyRepository policyRepository;

    @Mock
    private CryptoKeyMetadataRepository keyMetadataRepository;

    @Mock
    private KeyVaultAuditLogRepository auditLogRepository;

    private SecurityKeyVaultService keyVaultService;

    @BeforeEach
    void setUp() {
        keyVaultService = new SecurityKeyVaultService(policyRepository, keyMetadataRepository, auditLogRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityKeyVaultPolicy policy = SecurityKeyVaultPolicy.builder()
                .id(1L)
                .policyName("MASTER_KEY_VAULT_POLICY")
                .keyRotationDays(90)
                .defaultAlgorithm("AES-256-GCM")
                .hardwareSecurityModuleEnabled(true)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_KEY_VAULT_POLICY")).thenReturn(Optional.of(policy));

        KeyVaultPolicyResponse response = keyVaultService.getActivePolicy();

        assertNotNull(response);
        assertEquals(90, response.getKeyRotationDays());
        assertEquals("AES-256-GCM", response.getDefaultAlgorithm());
        assertTrue(response.isHardwareSecurityModuleEnabled());
    }

    @Test
    void generateCryptoKey_Success() {
        SecurityKeyVaultPolicy policy = SecurityKeyVaultPolicy.builder().keyRotationDays(90).defaultAlgorithm("AES-256-GCM").build();
        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(keyMetadataRepository.save(any())).thenAnswer(i -> {
            CryptoKeyMetadata key = i.getArgument(0);
            key.setId(1L);
            return key;
        });

        GenerateKeyRequest request = GenerateKeyRequest.builder()
                .keyAlias("PAYMENT-DATA-KEY")
                .algorithm("AES-256-GCM")
                .keyType("SYMMETRIC")
                .build();

        CryptoKeyResponse response = keyVaultService.generateCryptoKey(request);

        assertNotNull(response);
        assertEquals("PAYMENT-DATA-KEY", response.getKeyAlias());
        assertEquals("ACTIVE", response.getState());
        assertEquals(1, response.getVersion());
    }

    @Test
    void rotateKey_Success() {
        SecurityKeyVaultPolicy policy = SecurityKeyVaultPolicy.builder().keyRotationDays(90).build();
        CryptoKeyMetadata existing = CryptoKeyMetadata.builder()
                .id(1L)
                .keyId("KID-12345678")
                .keyAlias("PATIENT-RECORD-KEY")
                .algorithm("AES-256-GCM")
                .keyType("SYMMETRIC")
                .state("ACTIVE")
                .version(1)
                .build();

        when(keyMetadataRepository.findByKeyId("KID-12345678")).thenReturn(Optional.of(existing));
        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(keyMetadataRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CryptoKeyResponse rotated = keyVaultService.rotateKey("KID-12345678");

        assertNotNull(rotated);
        assertEquals("PATIENT-RECORD-KEY", rotated.getKeyAlias());
        assertEquals(2, rotated.getVersion());
        assertEquals("ACTIVE", rotated.getState());
    }

    @Test
    void revokeKey_Success() {
        CryptoKeyMetadata key = CryptoKeyMetadata.builder()
                .id(1L)
                .keyId("KID-87654321")
                .keyAlias("OLD-KEY")
                .state("ACTIVE")
                .build();

        when(keyMetadataRepository.findByKeyId("KID-87654321")).thenReturn(Optional.of(key));
        when(keyMetadataRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CryptoKeyResponse revoked = keyVaultService.revokeKey("KID-87654321");

        assertNotNull(revoked);
        assertEquals("REVOKED", revoked.getState());
        assertNotNull(revoked.getRevokedAt());
    }
}
