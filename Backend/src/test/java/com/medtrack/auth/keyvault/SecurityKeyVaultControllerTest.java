package com.medtrack.auth.keyvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.keyvault.controller.SecurityKeyVaultController;
import com.medtrack.auth.keyvault.dto.*;
import com.medtrack.auth.keyvault.service.SecurityKeyVaultService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link SecurityKeyVaultController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityKeyVaultControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityKeyVaultService keyVaultService;

    @InjectMocks
    private SecurityKeyVaultController keyVaultController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(keyVaultController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        KeyVaultPolicyResponse response = KeyVaultPolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_KEY_VAULT_POLICY")
                .keyRotationDays(90)
                .defaultAlgorithm("AES-256-GCM")
                .build();

        when(keyVaultService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/keyvault/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_KEY_VAULT_POLICY"))
                .andExpect(jsonPath("$.keyRotationDays").value(90));
    }

    @Test
    void rotateKey_Success() throws Exception {
        CryptoKeyResponse response = CryptoKeyResponse.builder()
                .keyId("KID-NEW123")
                .keyAlias("PATIENT-KEY")
                .state("ACTIVE")
                .version(2)
                .build();

        when(keyVaultService.rotateKey("KID-OLD123")).thenReturn(response);

        mockMvc.perform(post("/api/auth/keyvault/keys/KID-OLD123/rotate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.state").value("ACTIVE"));
    }
}
