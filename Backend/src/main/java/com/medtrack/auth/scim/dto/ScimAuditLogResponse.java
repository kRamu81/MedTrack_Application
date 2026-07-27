package com.medtrack.auth.scim.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimAuditLogResponse {
    private Long id;
    private String scimExternalId;
    private String actionType;
    private String executedBy;
    private String status;
    private String auditDetails;
    private LocalDateTime executedAt;
}
