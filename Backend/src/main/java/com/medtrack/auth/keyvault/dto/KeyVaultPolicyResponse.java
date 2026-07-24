package com.medtrack.auth.keyvault.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyVaultPolicyResponse {
    private Long id;
    private String policyName;
    private int keyRotationDays;
    private String defaultAlgorithm;
    private boolean autoRotationEnabled;
    private boolean hardwareSecurityModuleEnabled;
    private boolean exportKeysAllowed;
    private LocalDateTime updatedAt;
}
