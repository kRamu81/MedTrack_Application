package com.medtrack.auth.threat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.threat.controller.SecurityThreatController;
import com.medtrack.auth.threat.dto.*;
import com.medtrack.auth.threat.service.SecurityThreatService;
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
 * Controller unit tests for {@link SecurityThreatController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityThreatControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityThreatService threatService;

    @InjectMocks
    private SecurityThreatController threatController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(threatController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        ThreatPolicyResponse response = ThreatPolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_THREAT_POLICY")
                .maxFailedLoginsPerMinute(5)
                .anomalyRiskThreshold(75)
                .build();

        when(threatService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/threat/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_THREAT_POLICY"))
                .andExpect(jsonPath("$.anomalyRiskThreshold").value(75));
    }

    @Test
    void resolveIncident_Success() throws Exception {
        SecurityThreatIncidentResponse response = SecurityThreatIncidentResponse.builder()
                .incidentId("INC-2026-8801")
                .status("RESOLVED")
                .build();

        when(threatService.resolveIncident("INC-2026-8801")).thenReturn(response);

        mockMvc.perform(post("/api/auth/threat/incidents/INC-2026-8801/resolve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId").value("INC-2026-8801"))
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }
}
