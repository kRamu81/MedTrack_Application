package com.medtrack.auth.governance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceAuditScanResponse {
    private Long id;
    private String scanTitle;
    private int complianceScore;
    private int totalControlsEvaluated;
    private int passedControlsCount;
    private int failedControlsCount;
    private String overallStatus;
    private String summaryDetails;
    private LocalDateTime scannedAt;
}
