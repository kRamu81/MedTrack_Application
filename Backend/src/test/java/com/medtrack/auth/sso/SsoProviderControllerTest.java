package com.medtrack.auth.sso;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.sso.controller.SsoProviderController;
import com.medtrack.auth.sso.dto.*;
import com.medtrack.auth.sso.service.SsoProviderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link SsoProviderController}.
 */
@ExtendWith(MockitoExtension.class)
public class SsoProviderControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private SsoProviderService ssoProviderService;

    @InjectMocks
    private SsoProviderController ssoProviderController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(ssoProviderController).build();
    }

    @Test
    void configureProvider_Success() throws Exception {
        SsoProviderConfigResponse response = SsoProviderConfigResponse.builder()
                .id(10L)
                .providerName("Okta Auth")
                .domainKey("medtrack.org")
                .providerType("OAUTH2")
                .enabled(true)
                .build();

        when(ssoProviderService.configureProvider(any())).thenReturn(response);

        SsoProviderConfigRequest request = SsoProviderConfigRequest.builder()
                .providerName("Okta Auth")
                .domainKey("medtrack.org")
                .providerType("OAUTH2")
                .clientId("client123")
                .clientSecret("secret456")
                .enabled(true)
                .build();

        mockMvc.perform(post("/api/auth/sso/configure")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerName").value("Okta Auth"))
                .andExpect(jsonPath("$.domainKey").value("medtrack.org"));
    }

    @Test
    void initiateSso_Success() throws Exception {
        SsoLoginInitiateResponse response = SsoLoginInitiateResponse.builder()
                .ssoAvailable(true)
                .domainKey("medtrack.org")
                .providerName("Okta Auth")
                .redirectUrl("https://okta.medtrack.org/auth")
                .message("Redirecting to SSO")
                .build();

        when(ssoProviderService.initiateSsoLogin("admin@medtrack.org")).thenReturn(response);

        mockMvc.perform(post("/api/auth/sso/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "admin@medtrack.org"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ssoAvailable").value(true))
                .andExpect(jsonPath("$.providerName").value("Okta Auth"));
    }

    @Test
    void getAllProviders_Success() throws Exception {
        SsoProviderConfigResponse response = SsoProviderConfigResponse.builder()
                .id(10L)
                .providerName("Okta Auth")
                .domainKey("medtrack.org")
                .enabled(true)
                .build();

        when(ssoProviderService.getAllProviders()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/auth/sso/providers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].domainKey").value("medtrack.org"));
    }
}
