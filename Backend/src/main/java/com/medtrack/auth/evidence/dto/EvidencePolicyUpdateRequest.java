package com.medtrack.auth.evidence.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidencePolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Default framework standard is required")
    private String defaultFrameworkStandard; // SOC2, HIPAA, GDPR, ISO27001

    @NotBlank(message = "Hash algorithm is required")
    private String hashAlgorithm; // SHA-256, SHA-512

    private boolean wormStorageEnabled;

    @Min(value = 1, message = "Retention years must be at least 1 year")
    private int retentionYears;

    private boolean autoChainVerificationEnabled;
}
