package com.medtrack.auth.compliance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompliancePolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Active framework is required")
    private String activeFramework; // SOC2_TYPE2, HIPAA_HITECH, GDPR_ARTICLE32, ISO_27001

    @Min(value = 30, message = "Data retention period must be at least 30 days")
    private int dataRetentionDays;

    private boolean autoAuditScheduled;
    private boolean enforceStrictEvidenceLogs;
}
