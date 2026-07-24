package com.medtrack.auth.governance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovernancePolicyResponse {
    private Long id;
    private String policyName;
    private boolean hipaaComplianceEnabled;
    private boolean soc2ComplianceEnabled;
    private boolean gdprComplianceEnabled;
    private int passwordRotationDays;
    private int sessionTimeoutMinutes;
    private int auditLogRetentionDays;
    private boolean strictMfaRequired;
    private LocalDateTime updatedAt;
}
