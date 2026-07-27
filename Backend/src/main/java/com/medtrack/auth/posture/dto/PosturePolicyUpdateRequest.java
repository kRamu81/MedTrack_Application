package com.medtrack.auth.posture.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosturePolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Active benchmark standard is required")
    private String activeBenchmarkStandard; // CIS_BENCHMARK, NIST_800_53, ISO_27001

    @DecimalMin(value = "0.0", message = "Minimum score threshold must be non-negative")
    @DecimalMax(value = "100.0", message = "Minimum score threshold cannot exceed 100.0")
    private double minimumScoreThreshold;

    private boolean automatedAssessmentEnabled;
    private boolean notifyRiskThresholdBreaches;
}
