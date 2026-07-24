package com.medtrack.auth.compliance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.compliance.controller.ComplianceSecurityController;
import com.medtrack.auth.compliance.dto.*;
import com.medtrack.auth.compliance.service.ComplianceSecurityService;
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
 * Controller unit tests for {@link ComplianceSecurityController}.
 */
@ExtendWith(MockitoExtension.class)
public class ComplianceSecurityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ComplianceSecurityService complianceService;

    @InjectMocks
    private ComplianceSecurityController complianceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(complianceController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        CompliancePolicyResponse response = CompliancePolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_COMPLIANCE_POLICY")
                .activeFramework("SOC2_TYPE2")
                .dataRetentionDays(365)
                .build();

        when(complianceService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/compliance/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_COMPLIANCE_POLICY"))
                .andExpect(jsonPath("$.activeFramework").value("SOC2_TYPE2"));
    }

    @Test
    void runComplianceAudit_Success() throws Exception {
        ComplianceAuditReportResponse response = ComplianceAuditReportResponse.builder()
                .reportId("AUD-2026-9901")
                .frameworkStandard("SOC2_TYPE2")
                .complianceScorePercentage(100.0)
                .status("PASS")
                .build();

        when(complianceService.runComplianceAudit(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/compliance/audit/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(RunComplianceAuditRequest.builder()
                                .frameworkStandard("SOC2_TYPE2")
                                .evaluatorNotes("Audit run")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId").value("AUD-2026-9901"))
                .andExpect(jsonPath("$.status").value("PASS"));
    }
}
