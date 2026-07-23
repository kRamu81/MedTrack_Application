package com.medtrack.auth.sso.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO returned when initiating domain SSO login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsoLoginInitiateResponse {

    private boolean ssoAvailable;
    private String domainKey;
    private String providerName;
    private String redirectUrl;
    private String message;
}
