package com.medtrack.auth.scim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScimPolicyUpdateRequest {

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Primary IdP provider is required")
    private String primaryIdpProvider; // OKTA, AZURE_AD, PING_IDENTITY

    @NotBlank(message = "Default deprovision action is required")
    private String defaultDeprovisionAction; // SUSPEND, SOFT_DELETE, ANONYMIZE

    private boolean autoSyncEnabled;
    private boolean enforceRoleMapping;
}
