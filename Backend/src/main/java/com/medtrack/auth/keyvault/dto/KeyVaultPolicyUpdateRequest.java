package com.medtrack.auth.keyvault.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyVaultPolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @Min(value = 1, message = "Key rotation days must be at least 1")
    private int keyRotationDays;

    @NotBlank(message = "Default algorithm is required")
    private String defaultAlgorithm;

    private boolean autoRotationEnabled;
    private boolean hardwareSecurityModuleEnabled;
    private boolean exportKeysAllowed;
}
