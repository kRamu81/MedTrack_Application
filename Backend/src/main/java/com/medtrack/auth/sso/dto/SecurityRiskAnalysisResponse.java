package com.medtrack.auth.sso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returning security risk analysis for user sessions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityRiskAnalysisResponse {

    private Long userId;
    private int threatRiskScore; // 0 (low) to 100 (critical threat)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private int suspiciousEventCount;
    private List<String> detectedAnomalies;
    private LocalDateTime evaluatedAt;
}
