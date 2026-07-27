package com.medtrack.auth.observability.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing enterprise Security Observability policies & OpenTelemetry settings.
 */
@Entity
@Table(name = "security_observability_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityObservabilityPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    @Column(nullable = false)
    private String otelEndpointUrl; // e.g., https://otel.medtrack.internal:4318

    @Column(nullable = false)
    private double sampleRatePercentage; // 1.0 - 100.0%

    @Column(nullable = false)
    private int retentionDays; // 30, 90, 365 days

    @Column(nullable = false)
    private boolean traceContextPropagationEnabled;

    @Column(nullable = false)
    private boolean streamAlertsOnAnomaly;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
