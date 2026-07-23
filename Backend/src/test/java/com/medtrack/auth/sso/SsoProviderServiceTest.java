package com.medtrack.auth.sso;

import com.medtrack.auth.sso.dto.*;
import com.medtrack.auth.sso.model.SsoIdentityProvider;
import com.medtrack.auth.sso.repository.SsoIdentityProviderRepository;
import com.medtrack.auth.sso.service.SsoProviderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SsoProviderService}.
 */
@ExtendWith(MockitoExtension.class)
public class SsoProviderServiceTest {

    @Mock
    private SsoIdentityProviderRepository providerRepository;

    private SsoProviderService providerService;

    @BeforeEach
    void setUp() {
        providerService = new SsoProviderService(providerRepository);
    }

    @Test
    void configureProvider_Success() {
        SsoProviderConfigRequest request = SsoProviderConfigRequest.builder()
                .providerName("Google Workspace")
                .domainKey("stjude.org")
                .providerType("OAUTH2")
                .clientId("google-client-123")
                .clientSecret("secret-abc")
                .enabled(true)
                .build();

        when(providerRepository.findByDomainKey("stjude.org")).thenReturn(Optional.empty());
        when(providerRepository.save(any(SsoIdentityProvider.class))).thenAnswer(i -> i.getArgument(0));

        SsoProviderConfigResponse response = providerService.configureProvider(request);

        assertNotNull(response);
        assertEquals("Google Workspace", response.getProviderName());
        assertEquals("stjude.org", response.getDomainKey());
        assertTrue(response.isEnabled());
        verify(providerRepository).save(any(SsoIdentityProvider.class));
    }

    @Test
    void initiateSsoLogin_DomainMatchesEnabledProvider_ReturnsRedirectUrl() {
        SsoIdentityProvider provider = SsoIdentityProvider.builder()
                .id(1L)
                .providerName("Azure AD")
                .domainKey("mayoclinic.org")
                .clientId("azure-id-456")
                .authorizationUrl("https://login.microsoftonline.com/authorize")
                .enabled(true)
                .build();

        when(providerRepository.findByDomainKeyAndEnabledTrue("mayoclinic.org")).thenReturn(Optional.of(provider));

        SsoLoginInitiateResponse response = providerService.initiateSsoLogin("doctor@mayoclinic.org");

        assertTrue(response.isSsoAvailable());
        assertEquals("mayoclinic.org", response.getDomainKey());
        assertEquals("Azure AD", response.getProviderName());
        assertTrue(response.getRedirectUrl().contains("login.microsoftonline.com"));
    }

    @Test
    void initiateSsoLogin_NoProviderConfigured_ReturnsSsoUnavailable() {
        when(providerRepository.findByDomainKeyAndEnabledTrue("unknown.com")).thenReturn(Optional.empty());

        SsoLoginInitiateResponse response = providerService.initiateSsoLogin("user@unknown.com");

        assertFalse(response.isSsoAvailable());
        assertEquals("unknown.com", response.getDomainKey());
    }

    @Test
    void getAllProviders_ReturnsList() {
        SsoIdentityProvider provider = SsoIdentityProvider.builder()
                .id(1L)
                .providerName("Okta Enterprise")
                .domainKey("clevelandclinic.org")
                .enabled(true)
                .build();

        when(providerRepository.findAll()).thenReturn(List.of(provider));

        List<SsoProviderConfigResponse> list = providerService.getAllProviders();

        assertEquals(1, list.size());
        assertEquals("Okta Enterprise", list.get(0).getProviderName());
    }
}
