package com.medtrack.auth.scim.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimPolicyResponse {
    private Long id;
    private String policyName;
    private String primaryIdpProvider;
    private String defaultDeprovisionAction;
    private boolean autoSyncEnabled;
    private boolean enforceRoleMapping;
    private LocalDateTime updatedAt;
}
