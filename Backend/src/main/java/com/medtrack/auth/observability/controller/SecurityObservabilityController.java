package com.medtrack.auth.observability.controller;

import com.medtrack.auth.observability.dto.*;
import com.medtrack.auth.observability.service.SecurityObservabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Enterprise Security Observability & Real-Time Telemetry Streaming.
 */
@RestController
@RequestMapping("/api/auth/observability")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Observability & Telemetry Streaming", description = "APIs for OpenTelemetry log streams, security metrics, trace context propagation, and OTel endpoints.")
public class SecurityObservabilityController {

    private final SecurityObservabilityService observabilityService;

    @GetMapping("/policy")
    @Operation(summary = "Get Observability Policy", description = "Retrieves active OpenTelemetry stream settings and endpoint rules.")
    public ResponseEntity<ObservabilityPolicyResponse> getActivePolicy() {
        ObservabilityPolicyResponse policy = observabilityService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Observability Policy", description = "Updates OpenTelemetry collector URL, sample rate, and retention days.")
    public ResponseEntity<ObservabilityPolicyResponse> updatePolicy(@Valid @RequestBody ObservabilityPolicyUpdateRequest request) {
        ObservabilityPolicyResponse updated = observabilityService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/streams/ingest")
    @Operation(summary = "Ingest Telemetry Stream", description = "Ingests real-time security log or event telemetry stream.")
    public ResponseEntity<SecurityTelemetryStreamResponse> ingestTelemetryStream(@Valid @RequestBody IngestTelemetryStreamRequest request) {
        SecurityTelemetryStreamResponse response = observabilityService.ingestTelemetryStream(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/metrics/record")
    @Operation(summary = "Record Security Metric", description = "Samples a real-time security metric data point.")
    public ResponseEntity<SecurityMetricPointResponse> recordSecurityMetric(@Valid @RequestBody RecordSecurityMetricRequest request) {
        SecurityMetricPointResponse response = observabilityService.recordSecurityMetric(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/streams")
    @Operation(summary = "Get Telemetry Streams", description = "Retrieves all active security telemetry streams.")
    public ResponseEntity<List<SecurityTelemetryStreamResponse>> getAllStreams() {
        List<SecurityTelemetryStreamResponse> streams = observabilityService.getAllStreams();
        return ResponseEntity.ok(streams);
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get Security Metrics", description = "Retrieves all sampled security metric data points.")
    public ResponseEntity<List<SecurityMetricPointResponse>> getAllMetrics() {
        List<SecurityMetricPointResponse> metrics = observabilityService.getAllMetrics();
        return ResponseEntity.ok(metrics);
    }
}
