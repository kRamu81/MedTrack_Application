package com.medtrack.auth.posture.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RunPostureEvaluationRequest {

    @NotBlank(message = "Benchmark standard is required")
    private String benchmarkStandard; // CIS_BENCHMARK, NIST_800_53, ISO_27001

    private String evaluationNotes;
}
