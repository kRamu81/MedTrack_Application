package com.medtrack.auth.governance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.governance.controller.SecurityGovernanceController;
import com.medtrack.auth.governance.dto.*;
import com.medtrack.auth.governance.service.SecurityGovernanceService;
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
 * Controller unit tests for {@link SecurityGovernanceController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityGovernanceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityGovernanceService governanceService;

    @InjectMocks
    private SecurityGovernanceController governanceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(governanceController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        GovernancePolicyResponse response = GovernancePolicyResponse.builder()
                .id(1L)
                .policyName("ENTERPRISE_GOVERNANCE_POLICY")
                .hipaaComplianceEnabled(true)
                .passwordRotationDays(90)
                .build();

        when(governanceService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/governance/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("ENTERPRISE_GOVERNANCE_POLICY"))
                .andExpect(jsonPath("$.passwordRotationDays").value(90));
    }

    @Test
    void runComplianceScan_Success() throws Exception {
        ComplianceAuditScanResponse response = ComplianceAuditScanResponse.builder()
                .id(100L)
                .complianceScore(100)
                .overallStatus("COMPLIANT")
                .summaryDetails("All controls passed.")
                .build();

        when(governanceService.runComplianceScan()).thenReturn(response);

        mockMvc.perform(post("/api/auth/governance/scan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complianceScore").value(100))
                .andExpect(jsonPath("$.overallStatus").value("COMPLIANT"));
    }
}
