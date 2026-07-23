package com.medtrack.auth.sso.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for configuring an Enterprise SSO Identity Provider.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsoProviderConfigRequest {

    @NotBlank(message = "Provider name is required")
    private String providerName;

    @NotBlank(message = "Domain key is required (e.g. stjude.org)")
    private String domainKey;

    @NotBlank(message = "Provider type is required (OAUTH2, SAML2, OIDC)")
    private String providerType;

    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "Client Secret is required")
    private String clientSecret;

    private String authorizationUrl;
    private String tokenUrl;
    private String userInfoUrl;
    private String samlMetadataUrl;

    private boolean enabled;
}
