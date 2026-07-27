package com.medtrack.auth.observability.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestTelemetryStreamRequest {

    @NotBlank(message = "Stream source is required")
    private String streamSource; // AUTHENTICATION_SERVICE, ZERO_TRUST_PROXY, KEY_VAULT

    @NotBlank(message = "Event type is required")
    private String eventType; // ACCESS_GRANTED, ACCESS_DENIED, SUSPICIOUS_IP_BURST

    @Positive(message = "Payload size must be positive")
    private long payloadSizeBytes;

    @Positive(message = "Throughput Mbps must be positive")
    private double throughputMbps;

    private String traceMetadata;
}
