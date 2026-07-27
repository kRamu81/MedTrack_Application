package com.medtrack.auth.scim.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimUserMappingResponse {
    private Long id;
    private String scimExternalId;
    private String medtrackUsername;
    private String email;
    private String enterpriseIdpProvider;
    private String assignedRole;
    private String syncStatus;
    private LocalDateTime lastSyncedAt;
}
