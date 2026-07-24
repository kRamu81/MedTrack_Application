package com.medtrack.auth.zerotrust.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpThreatEvaluationResponse {
    private String ipAddress;
    private String countryCode;
    private int threatScore;
    private String threatLevel;
    private boolean blocked;
    private LocalDateTime blockedUntil;
    private int failedAttemptsCount;
    private String decisionMessage;
}
