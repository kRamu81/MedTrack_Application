package com.medtrack.auth.sso.service;

import com.medtrack.auth.sso.dto.*;
import com.medtrack.auth.sso.model.SsoIdentityProvider;
import com.medtrack.auth.sso.repository.SsoIdentityProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Single Sign-On (SSO) and Federated Identity Providers.
 */
@Service
@RequiredArgsConstructor
public class SsoProviderService {

    private final SsoIdentityProviderRepository providerRepository;

    /**
     * Registers or updates an SSO Identity Provider configuration for a corporate domain.
     *
     * @param request {@link SsoProviderConfigRequest} configuration parameters
     * @return saved {@link SsoProviderConfigResponse}
     */
    @Transactional
    public SsoProviderConfigResponse configureProvider(SsoProviderConfigRequest request) {
        String domainKey = request.getDomainKey().toLowerCase().trim();

        SsoIdentityProvider provider = providerRepository.findByDomainKey(domainKey)
                .orElse(SsoIdentityProvider.builder()
                        .domainKey(domainKey)
                        .createdAt(LocalDateTime.now())
                        .build());

        provider.setProviderName(request.getProviderName());
        provider.setProviderType(request.getProviderType());
        provider.setClientId(request.getClientId());
        provider.setClientSecret(request.getClientSecret());
        provider.setAuthorizationUrl(request.getAuthorizationUrl());
        provider.setTokenUrl(request.getTokenUrl());
        provider.setUserInfoUrl(request.getUserInfoUrl());
        provider.setSamlMetadataUrl(request.getSamlMetadataUrl());
        provider.setEnabled(request.isEnabled());
        provider.setUpdatedAt(LocalDateTime.now());

        SsoIdentityProvider saved = providerRepository.save(provider);
        return mapToResponse(saved);
    }

    /**
     * Initiates SSO login flow by resolving the user's email domain to an enabled identity provider.
     *
     * @param email corporate email address
     * @return {@link SsoLoginInitiateResponse} containing redirect URL or availability status
     */
    @Transactional(readOnly = true)
    public SsoLoginInitiateResponse initiateSsoLogin(String email) {
        if (email == null || !email.contains("@")) {
            return SsoLoginInitiateResponse.builder()
                    .ssoAvailable(false)
                    .message("Invalid email address format")
                    .build();
        }

        String domain = email.substring(email.indexOf("@") + 1).toLowerCase().trim();
        Optional<SsoIdentityProvider> providerOpt = providerRepository.findByDomainKeyAndEnabledTrue(domain);

        if (providerOpt.isEmpty()) {
            return SsoLoginInitiateResponse.builder()
                    .ssoAvailable(false)
                    .domainKey(domain)
                    .message("No active SSO provider configured for domain: " + domain)
                    .build();
        }

        SsoIdentityProvider provider = providerOpt.get();
        String redirectUrl = String.format("%s?client_id=%s&redirect_uri=http://localhost:3000/sso/callback&response_type=code&scope=openid%%20email%%20profile",
                provider.getAuthorizationUrl() != null ? provider.getAuthorizationUrl() : "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                provider.getClientId());

        return SsoLoginInitiateResponse.builder()
                .ssoAvailable(true)
                .domainKey(domain)
                .providerName(provider.getProviderName())
                .redirectUrl(redirectUrl)
                .message("SSO Provider resolved. Redirecting to " + provider.getProviderName())
                .build();
    }

    /**
     * Retrieves all configured SSO Identity Providers.
     *
     * @return list of {@link SsoProviderConfigResponse} objects
     */
    @Transactional(readOnly = true)
    public List<SsoProviderConfigResponse> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Toggles enabled state for a provider.
     */
    @Transactional
    public boolean toggleProviderState(Long providerId, boolean enabled) {
        Optional<SsoIdentityProvider> providerOpt = providerRepository.findById(providerId);
        if (providerOpt.isPresent()) {
            SsoIdentityProvider provider = providerOpt.get();
            provider.setEnabled(enabled);
            provider.setUpdatedAt(LocalDateTime.now());
            providerRepository.save(provider);
            return true;
        }
        return false;
    }

    private SsoProviderConfigResponse mapToResponse(SsoIdentityProvider provider) {
        return SsoProviderConfigResponse.builder()
                .id(provider.getId())
                .providerName(provider.getProviderName())
                .domainKey(provider.getDomainKey())
                .providerType(provider.getProviderType())
                .clientId(provider.getClientId())
                .authorizationUrl(provider.getAuthorizationUrl())
                .samlMetadataUrl(provider.getSamlMetadataUrl())
                .enabled(provider.isEnabled())
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }
}
