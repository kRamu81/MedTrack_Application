package com.medtrack.auth.governance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovernancePolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    private boolean hipaaComplianceEnabled;
    private boolean soc2ComplianceEnabled;
    private boolean gdprComplianceEnabled;

    @Min(value = 1, message = "Password rotation must be at least 1 day")
    private int passwordRotationDays;

    @Min(value = 1, message = "Session timeout must be at least 1 minute")
    private int sessionTimeoutMinutes;

    @Min(value = 1, message = "Audit log retention must be at least 1 day")
    private int auditLogRetentionDays;

    private boolean strictMfaRequired;
}
