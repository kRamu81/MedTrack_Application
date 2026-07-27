package com.medtrack.auth.evidence.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidencePolicyResponse {
    private Long id;
    private String policyName;
    private String defaultFrameworkStandard;
    private String hashAlgorithm;
    private boolean wormStorageEnabled;
    private int retentionYears;
    private boolean autoChainVerificationEnabled;
    private LocalDateTime updatedAt;
}
