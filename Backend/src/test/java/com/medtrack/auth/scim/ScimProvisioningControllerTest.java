package com.medtrack.auth.scim;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.scim.controller.ScimProvisioningController;
import com.medtrack.auth.scim.dto.*;
import com.medtrack.auth.scim.service.ScimProvisioningService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link ScimProvisioningController}.
 */
@ExtendWith(MockitoExtension.class)
public class ScimProvisioningControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ScimProvisioningService scimService;

    @InjectMocks
    private ScimProvisioningController scimController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(scimController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        ScimPolicyResponse response = ScimPolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_SCIM_POLICY")
                .primaryIdpProvider("OKTA")
                .defaultDeprovisionAction("SUSPEND")
                .build();

        when(scimService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/scim/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_SCIM_POLICY"))
                .andExpect(jsonPath("$.primaryIdpProvider").value("OKTA"));
    }

    @Test
    void provisionScimUser_Success() throws Exception {
        ScimUserMappingResponse response = ScimUserMappingResponse.builder()
                .scimExternalId("okta-999")
                .medtrackUsername("alice.smith")
                .syncStatus("PROVISIONED")
                .build();

        when(scimService.provisionScimUser(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/scim/users/provision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(ProvisionScimUserRequest.builder()
                                .scimExternalId("okta-999")
                                .medtrackUsername("alice.smith")
                                .email("alice@medtrack.org")
                                .enterpriseIdpProvider("OKTA")
                                .assignedRole("HOSPITAL_ADMIN")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scimExternalId").value("okta-999"))
                .andExpect(jsonPath("$.syncStatus").value("PROVISIONED"));
    }
}
