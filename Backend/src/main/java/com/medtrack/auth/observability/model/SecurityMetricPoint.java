package com.medtrack.auth.observability.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking aggregated real-time security metric data points.
 */
@Entity
@Table(name = "security_metric_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityMetricPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String metricId; // e.g., METRIC-LATENCY-01

    @Column(nullable = false)
    private String metricName; // auth_latency_ms, failed_mfa_attempts, active_jwt_tokens

    @Column(nullable = false)
    private String metricCategory; // COUNTER, GAUGE, HISTOGRAM

    @Column(nullable = false)
    private double metricValue;

    @Column(nullable = false)
    private String unit; // ms, count, percentage

    @Column(length = 1000)
    private String labelTags; // env=prod,region=us-east-1

    @Column(nullable = false)
    private LocalDateTime sampledAt;
}
