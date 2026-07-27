package com.medtrack.auth.observability.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityMetricPointResponse {
    private Long id;
    private String metricId;
    private String metricName;
    private String metricCategory;
    private double metricValue;
    private String unit;
    private String labelTags;
    private LocalDateTime sampledAt;
}
