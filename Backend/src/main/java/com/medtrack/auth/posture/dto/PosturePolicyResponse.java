package com.medtrack.auth.posture.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosturePolicyResponse {
    private Long id;
    private String policyName;
    private String activeBenchmarkStandard;
    private double minimumScoreThreshold;
    private boolean automatedAssessmentEnabled;
    private boolean notifyRiskThresholdBreaches;
    private LocalDateTime updatedAt;
}
