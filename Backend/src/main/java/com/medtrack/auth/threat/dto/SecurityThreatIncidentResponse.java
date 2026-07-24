package com.medtrack.auth.threat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityThreatIncidentResponse {
    private Long id;
    private String incidentId;
    private String threatType;
    private String threatLevel;
    private int riskScore;
    private String sourceIp;
    private String targetUsername;
    private String status;
    private String incidentDetails;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;
}
