package com.medtrack.auth.observability.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityTelemetryStreamResponse {
    private Long id;
    private String streamId;
    private String streamSource;
    private String eventType;
    private long payloadSizeBytes;
    private double throughputMbps;
    private String streamStatus;
    private String traceMetadata;
    private LocalDateTime lastStreamedAt;
}
