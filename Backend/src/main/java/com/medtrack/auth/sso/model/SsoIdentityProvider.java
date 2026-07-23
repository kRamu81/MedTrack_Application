package com.medtrack.auth.sso.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Enterprise JPA entity storing Single Sign-On (SSO) and Federated Identity Provider (IdP)
 * configurations (Google Workspace, Microsoft Entra ID / Azure AD, Okta, SAML 2.0).
 */
@Entity
@Table(name = "sso_identity_providers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsoIdentityProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String providerName; // e.g. "Google Workspace", "Azure AD", "Okta", "Custom SAML 2.0"

    @Column(nullable = false, unique = true)
    private String domainKey; // e.g. "stjude.org", "mayoclinic.org"

    @Column(nullable = false)
    private String providerType; // OAUTH2, SAML2, OIDC

    @Column(nullable = false)
    private String clientId;

    @Column(nullable = false)
    private String clientSecret;

    private String authorizationUrl;
    private String tokenUrl;
    private String userInfoUrl;
    private String samlMetadataUrl;

    @Column(nullable = false)
    private boolean enabled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
