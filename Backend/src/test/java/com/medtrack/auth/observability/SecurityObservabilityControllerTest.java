package com.medtrack.auth.observability;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.observability.controller.SecurityObservabilityController;
import com.medtrack.auth.observability.dto.*;
import com.medtrack.auth.observability.service.SecurityObservabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link SecurityObservabilityController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityObservabilityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityObservabilityService observabilityService;

    @InjectMocks
    private SecurityObservabilityController observabilityController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(observabilityController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        ObservabilityPolicyResponse response = ObservabilityPolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_OBSERVABILITY_POLICY")
                .otelEndpointUrl("https://otel.medtrack.internal:4318")
                .sampleRatePercentage(100.0)
                .build();

        when(observabilityService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/observability/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_OBSERVABILITY_POLICY"))
                .andExpect(jsonPath("$.otelEndpointUrl").value("https://otel.medtrack.internal:4318"));
    }

    @Test
    void ingestTelemetryStream_Success() throws Exception {
        SecurityTelemetryStreamResponse response = SecurityTelemetryStreamResponse.builder()
                .streamId("STRM-88091")
                .streamSource("AUTHENTICATION_SERVICE")
                .streamStatus("ACTIVE")
                .build();

        when(observabilityService.ingestTelemetryStream(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/observability/streams/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(IngestTelemetryStreamRequest.builder()
                                .streamSource("AUTHENTICATION_SERVICE")
                                .eventType("ACCESS_GRANTED")
                                .payloadSizeBytes(2048)
                                .throughputMbps(12.5)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.streamId").value("STRM-88091"))
                .andExpect(jsonPath("$.streamStatus").value("ACTIVE"));
    }
}
