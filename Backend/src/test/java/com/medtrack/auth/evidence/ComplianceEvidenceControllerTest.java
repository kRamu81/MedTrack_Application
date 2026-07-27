package com.medtrack.auth.evidence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.evidence.controller.ComplianceEvidenceController;
import com.medtrack.auth.evidence.dto.*;
import com.medtrack.auth.evidence.service.ComplianceEvidenceService;
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
 * Controller unit tests for {@link ComplianceEvidenceController}.
 */
@ExtendWith(MockitoExtension.class)
public class ComplianceEvidenceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ComplianceEvidenceService evidenceService;

    @InjectMocks
    private ComplianceEvidenceController evidenceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(evidenceController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        EvidencePolicyResponse response = EvidencePolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_EVIDENCE_POLICY")
                .defaultFrameworkStandard("SOC2")
                .hashAlgorithm("SHA-256")
                .wormStorageEnabled(true)
                .build();

        when(evidenceService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/evidence/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_EVIDENCE_POLICY"))
                .andExpect(jsonPath("$.defaultFrameworkStandard").value("SOC2"));
    }

    @Test
    void ingestEvidenceRecord_Success() throws Exception {
        ComplianceEvidenceRecordResponse response = ComplianceEvidenceRecordResponse.builder()
                .evidenceId("EVD-8801")
                .frameworkStandard("SOC2")
                .verificationStatus("VERIFIED")
                .build();

        when(evidenceService.ingestEvidenceRecord(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/evidence/records/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(IngestEvidenceRecordRequest.builder()
                                .frameworkStandard("SOC2")
                                .controlReference("CC6.1")
                                .evidenceType("LOG_EXPORT")
                                .storageUri("s3://medtrack-vault/evd-8801.log")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evidenceId").value("EVD-8801"))
                .andExpect(jsonPath("$.verificationStatus").value("VERIFIED"));
    }
}
