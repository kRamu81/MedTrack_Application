package com.medtrack.auth.zerotrust.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZeroTrustPolicyResponse {
    private Long id;
    private String policyName;
    private boolean ipWhitelistEnabled;
    private boolean geoFencingEnabled;
    private int maxFailedAttemptsThreshold;
    private int ipBlockDurationMinutes;
    private boolean anomalyDetectionEnabled;
    private LocalDateTime updatedAt;
}
