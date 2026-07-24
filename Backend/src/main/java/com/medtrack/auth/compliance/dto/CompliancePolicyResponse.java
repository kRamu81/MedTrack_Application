package com.medtrack.auth.compliance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompliancePolicyResponse {
    private Long id;
    private String policyName;
    private String activeFramework;
    private int dataRetentionDays;
    private boolean autoAuditScheduled;
    private boolean enforceStrictEvidenceLogs;
    private LocalDateTime updatedAt;
}
