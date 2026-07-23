package com.medtrack.auth.sso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Response DTO returning Identity Provider details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsoProviderConfigResponse {

    private Long id;
    private String providerName;
    private String domainKey;
    private String providerType;
    private String clientId;
    private String authorizationUrl;
    private String samlMetadataUrl;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
