package com.medtrack.auth.threat.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreatPolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @Min(value = 1, message = "Max failed logins per minute must be at least 1")
    private int maxFailedLoginsPerMinute;

    @Min(value = 0, message = "Anomaly risk threshold minimum is 0")
    @Max(value = 100, message = "Anomaly risk threshold maximum is 100")
    private int anomalyRiskThreshold;

    private boolean autoContainmentEnabled;
    private boolean notifySecurityOperationsCenter;
}
