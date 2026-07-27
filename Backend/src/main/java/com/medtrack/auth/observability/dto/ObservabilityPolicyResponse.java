package com.medtrack.auth.observability.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservabilityPolicyResponse {
    private Long id;
    private String policyName;
    private String otelEndpointUrl;
    private double sampleRatePercentage;
    private int retentionDays;
    private boolean traceContextPropagationEnabled;
    private boolean streamAlertsOnAnomaly;
    private LocalDateTime updatedAt;
}
