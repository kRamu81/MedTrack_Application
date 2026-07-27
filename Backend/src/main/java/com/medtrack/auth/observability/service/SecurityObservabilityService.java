package com.medtrack.auth.observability.service;

import com.medtrack.auth.observability.dto.*;
import com.medtrack.auth.observability.model.*;
import com.medtrack.auth.observability.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Real-Time Security Observability & Telemetry Streaming.
 */
@Service
@RequiredArgsConstructor
public class SecurityObservabilityService {

    private final SecurityObservabilityPolicyRepository policyRepository;
    private final SecurityTelemetryStreamRepository streamRepository;
    private final SecurityMetricPointRepository metricRepository;

    private static final String DEFAULT_POLICY_NAME = "MASTER_OBSERVABILITY_POLICY";

    /**
     * Seeds default OpenTelemetry policy and initial security metrics baseline.
     */
    @PostConstruct
    @Transactional
    public void seedObservabilityBaseline() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            SecurityObservabilityPolicy policy = SecurityObservabilityPolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .otelEndpointUrl("https://otel.medtrack.internal:4318")
                    .sampleRatePercentage(100.0)
                    .retentionDays(90)
                    .traceContextPropagationEnabled(true)
                    .streamAlertsOnAnomaly(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        seedDefaultMetric("auth_latency_ms", "GAUGE", 14.2, "ms", "env=prod,service=auth");
        seedDefaultMetric("failed_mfa_attempts", "COUNTER", 3.0, "count", "env=prod,service=mfa");
        seedDefaultMetric("active_jwt_tokens", "GAUGE", 1420.0, "count", "env=prod,service=jwt");
    }

    private void seedDefaultMetric(String name, String cat, double val, String unit, String tags) {
        if (metricRepository.findByMetricName(name).isEmpty()) {
            metricRepository.save(SecurityMetricPoint.builder()
                    .metricId("MTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .metricName(name)
                    .metricCategory(cat)
                    .metricValue(val)
                    .unit(unit)
                    .labelTags(tags)
                    .sampledAt(LocalDateTime.now())
                    .build());
        }
    }

    /**
     * Retrieves active security observability policy settings.
     */
    @Transactional(readOnly = true)
    public ObservabilityPolicyResponse getActivePolicy() {
        SecurityObservabilityPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates security observability policy settings.
     */
    @Transactional
    public ObservabilityPolicyResponse updatePolicy(ObservabilityPolicyUpdateRequest request) {
        SecurityObservabilityPolicy policy = getOrCreatePolicy();
        policy.setOtelEndpointUrl(request.getOtelEndpointUrl());
        policy.setSampleRatePercentage(request.getSampleRatePercentage());
        policy.setRetentionDays(request.getRetentionDays());
        policy.setTraceContextPropagationEnabled(request.isTraceContextPropagationEnabled());
        policy.setStreamAlertsOnAnomaly(request.isStreamAlertsOnAnomaly());
        policy.setUpdatedAt(LocalDateTime.now());

        SecurityObservabilityPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Ingests a new real-time security log and event telemetry stream.
     */
    @Transactional
    public SecurityTelemetryStreamResponse ingestTelemetryStream(IngestTelemetryStreamRequest request) {
        String streamId = "STRM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SecurityTelemetryStream stream = SecurityTelemetryStream.builder()
                .streamId(streamId)
                .streamSource(request.getStreamSource().toUpperCase())
                .eventType(request.getEventType().toUpperCase())
                .payloadSizeBytes(request.getPayloadSizeBytes())
                .throughputMbps(request.getThroughputMbps())
                .streamStatus("ACTIVE")
                .traceMetadata(request.getTraceMetadata() != null ? request.getTraceMetadata() : "OTel Trace Context: trace_id=" + UUID.randomUUID())
                .lastStreamedAt(LocalDateTime.now())
                .build();

        SecurityTelemetryStream saved = streamRepository.save(stream);
        return mapToStreamResponse(saved);
    }

    /**
     * Records a new real-time security metric data point.
     */
    @Transactional
    public SecurityMetricPointResponse recordSecurityMetric(RecordSecurityMetricRequest request) {
        String metricId = "MTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SecurityMetricPoint metric = SecurityMetricPoint.builder()
                .metricId(metricId)
                .metricName(request.getMetricName())
                .metricCategory(request.getMetricCategory().toUpperCase())
                .metricValue(request.getMetricValue())
                .unit(request.getUnit())
                .labelTags(request.getLabelTags() != null ? request.getLabelTags() : "env=prod")
                .sampledAt(LocalDateTime.now())
                .build();

        SecurityMetricPoint saved = metricRepository.save(metric);
        return mapToMetricResponse(saved);
    }

    /**
     * Retrieves all active security telemetry streams.
     */
    @Transactional(readOnly = true)
    public List<SecurityTelemetryStreamResponse> getAllStreams() {
        return streamRepository.findAll().stream()
                .map(this::mapToStreamResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all sampled security metric data points.
     */
    @Transactional(readOnly = true)
    public List<SecurityMetricPointResponse> getAllMetrics() {
        return metricRepository.findAll().stream()
                .map(this::mapToMetricResponse)
                .collect(Collectors.toList());
    }

    private SecurityObservabilityPolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(SecurityObservabilityPolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .otelEndpointUrl("https://otel.medtrack.internal:4318")
                        .sampleRatePercentage(100.0)
                        .retentionDays(90)
                        .traceContextPropagationEnabled(true)
                        .streamAlertsOnAnomaly(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private ObservabilityPolicyResponse mapToPolicyResponse(SecurityObservabilityPolicy policy) {
        return ObservabilityPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .otelEndpointUrl(policy.getOtelEndpointUrl())
                .sampleRatePercentage(policy.getSampleRatePercentage())
                .retentionDays(policy.getRetentionDays())
                .traceContextPropagationEnabled(policy.isTraceContextPropagationEnabled())
                .streamAlertsOnAnomaly(policy.isStreamAlertsOnAnomaly())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private SecurityTelemetryStreamResponse mapToStreamResponse(SecurityTelemetryStream stream) {
        return SecurityTelemetryStreamResponse.builder()
                .id(stream.getId())
                .streamId(stream.getStreamId())
                .streamSource(stream.getStreamSource())
                .eventType(stream.getEventType())
                .payloadSizeBytes(stream.getPayloadSizeBytes())
                .throughputMbps(stream.getThroughputMbps())
                .streamStatus(stream.getStreamStatus())
                .traceMetadata(stream.getTraceMetadata())
                .lastStreamedAt(stream.getLastStreamedAt())
                .build();
    }

    private SecurityMetricPointResponse mapToMetricResponse(SecurityMetricPoint metric) {
        return SecurityMetricPointResponse.builder()
                .id(metric.getId())
                .metricId(metric.getMetricId())
                .metricName(metric.getMetricName())
                .metricCategory(metric.getMetricCategory())
                .metricValue(metric.getMetricValue())
                .unit(metric.getUnit())
                .labelTags(metric.getLabelTags())
                .sampledAt(metric.getSampledAt())
                .build();
    }
}
