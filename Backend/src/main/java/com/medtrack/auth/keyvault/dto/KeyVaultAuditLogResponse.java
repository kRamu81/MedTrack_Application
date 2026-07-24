package com.medtrack.auth.keyvault.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyVaultAuditLogResponse {
    private Long id;
    private String keyId;
    private String operation;
    private String actorUsername;
    private String ipAddress;
    private String status;
    private String details;
    private LocalDateTime timestamp;
}
