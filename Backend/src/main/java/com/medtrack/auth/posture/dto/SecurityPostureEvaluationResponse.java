package com.medtrack.auth.posture.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPostureEvaluationResponse {
    private Long id;
    private String evaluationId;
    private String benchmarkStandard;
    private double overallPostureScore;
    private String riskRating;
    private int evaluatedControlsCount;
    private int compliantControlsCount;
    private String evaluatedBy;
    private String evaluationSummary;
    private LocalDateTime evaluationTimestamp;
}
