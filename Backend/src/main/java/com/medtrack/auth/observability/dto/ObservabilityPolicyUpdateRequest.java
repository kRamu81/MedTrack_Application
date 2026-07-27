package com.medtrack.auth.observability.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservabilityPolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "OpenTelemetry Endpoint URL is required")
    private String otelEndpointUrl;

    @DecimalMin(value = "1.0", message = "Sample rate must be at least 1.0%")
    @DecimalMax(value = "100.0", message = "Sample rate cannot exceed 100.0%")
    private double sampleRatePercentage;

    @Min(value = 1, message = "Retention days must be at least 1 day")
    private int retentionDays;

    private boolean traceContextPropagationEnabled;
    private boolean streamAlertsOnAnomaly;
}
