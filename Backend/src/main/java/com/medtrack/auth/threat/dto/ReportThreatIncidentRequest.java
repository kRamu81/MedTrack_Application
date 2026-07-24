package com.medtrack.auth.threat.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportThreatIncidentRequest {

    @NotBlank(message = "Threat type is required")
    private String threatType; // BRUTE_FORCE, ANOMALOUS_GEOLOCATION, PRIVILEGE_ESCALATION, DATA_EXFILTRATION

    @NotBlank(message = "Threat level is required")
    private String threatLevel; // CRITICAL, HIGH, MEDIUM, LOW

    @Min(value = 0, message = "Risk score minimum is 0")
    @Max(value = 100, message = "Risk score maximum is 100")
    private int riskScore;

    private String sourceIp;
    private String targetUsername;
    private String incidentDetails;
}
