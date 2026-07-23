package com.medtrack.auth.authority.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for exposing authority security audit logs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String username;
    private String eventType;
    private String description;
    private Long previousAuthorityVersion;
    private Long newAuthorityVersion;
    private String updatedBy;
    private LocalDateTime timestamp;
}
