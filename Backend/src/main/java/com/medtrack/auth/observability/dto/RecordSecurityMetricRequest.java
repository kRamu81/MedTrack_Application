package com.medtrack.auth.observability.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordSecurityMetricRequest {

    @NotBlank(message = "Metric name is required")
    private String metricName; // auth_latency_ms, failed_mfa_attempts, active_jwt_tokens

    @NotBlank(message = "Metric category is required")
    private String metricCategory; // COUNTER, GAUGE, HISTOGRAM

    private double metricValue;

    @NotBlank(message = "Unit is required")
    private String unit; // ms, count, percentage

    private String labelTags; // env=prod,region=us-east-1
}
