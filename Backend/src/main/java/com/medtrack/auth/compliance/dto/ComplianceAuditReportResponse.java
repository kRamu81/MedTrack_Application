package com.medtrack.auth.compliance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceAuditReportResponse {
    private Long id;
    private String reportId;
    private String frameworkStandard;
    private double complianceScorePercentage;
    private String status;
    private int totalControlsEvaluated;
    private int passedControlsCount;
    private String evaluatedBy;
    private String executiveSummary;
    private LocalDateTime auditDate;
}
