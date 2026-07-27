package com.medtrack.auth.observability;

import com.medtrack.auth.observability.dto.*;
import com.medtrack.auth.observability.model.*;
import com.medtrack.auth.observability.repository.*;
import com.medtrack.auth.observability.service.SecurityObservabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SecurityObservabilityService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityObservabilityServiceTest {

    @Mock
    private SecurityObservabilityPolicyRepository policyRepository;

    @Mock
    private SecurityTelemetryStreamRepository streamRepository;

    @Mock
    private SecurityMetricPointRepository metricRepository;

    private SecurityObservabilityService observabilityService;

    @BeforeEach
    void setUp() {
        observabilityService = new SecurityObservabilityService(policyRepository, streamRepository, metricRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityObservabilityPolicy policy = SecurityObservabilityPolicy.builder()
                .id(1L)
                .policyName("MASTER_OBSERVABILITY_POLICY")
                .otelEndpointUrl("https://otel.medtrack.internal:4318")
                .sampleRatePercentage(100.0)
                .retentionDays(90)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_OBSERVABILITY_POLICY")).thenReturn(Optional.of(policy));

        ObservabilityPolicyResponse response = observabilityService.getActivePolicy();

        assertNotNull(response);
        assertEquals("https://otel.medtrack.internal:4318", response.getOtelEndpointUrl());
        assertEquals(90, response.getRetentionDays());
    }

    @Test
    void ingestTelemetryStream_Success() {
        when(streamRepository.save(any())).thenAnswer(i -> {
            SecurityTelemetryStream s = i.getArgument(0);
            s.setId(1L);
            return s;
        });

        IngestTelemetryStreamRequest request = IngestTelemetryStreamRequest.builder()
                .streamSource("AUTHENTICATION_SERVICE")
                .eventType("ACCESS_GRANTED")
                .payloadSizeBytes(2048)
                .throughputMbps(12.5)
                .traceMetadata("trace_id=9901")
                .build();

        SecurityTelemetryStreamResponse response = observabilityService.ingestTelemetryStream(request);

        assertNotNull(response);
        assertEquals("AUTHENTICATION_SERVICE", response.getStreamSource());
        assertEquals("ACTIVE", response.getStreamStatus());
    }

    @Test
    void recordSecurityMetric_Success() {
        when(metricRepository.save(any())).thenAnswer(i -> {
            SecurityMetricPoint m = i.getArgument(0);
            m.setId(1L);
            return m;
        });

        RecordSecurityMetricRequest request = RecordSecurityMetricRequest.builder()
                .metricName("auth_latency_ms")
                .metricCategory("GAUGE")
                .metricValue(15.4)
                .unit("ms")
                .labelTags("env=prod")
                .build();

        SecurityMetricPointResponse response = observabilityService.recordSecurityMetric(request);

        assertNotNull(response);
        assertEquals("auth_latency_ms", response.getMetricName());
        assertEquals(15.4, response.getMetricValue());
    }
}
