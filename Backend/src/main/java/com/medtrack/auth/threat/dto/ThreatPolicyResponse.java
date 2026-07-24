package com.medtrack.auth.threat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreatPolicyResponse {
    private Long id;
    private String policyName;
    private int maxFailedLoginsPerMinute;
    private int anomalyRiskThreshold;
    private boolean autoContainmentEnabled;
    private boolean notifySecurityOperationsCenter;
    private LocalDateTime updatedAt;
}
