package com.medtrack.auth.zerotrust.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZeroTrustPolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    private boolean ipWhitelistEnabled;
    private boolean geoFencingEnabled;

    @Min(value = 1, message = "Max failed attempts threshold must be at least 1")
    private int maxFailedAttemptsThreshold;

    @Min(value = 1, message = "Block duration must be at least 1 minute")
    private int ipBlockDurationMinutes;

    private boolean anomalyDetectionEnabled;
}
