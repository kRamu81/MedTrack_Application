package com.medtrack.auth.posture;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.posture.controller.SecurityPostureController;
import com.medtrack.auth.posture.dto.*;
import com.medtrack.auth.posture.service.SecurityPostureService;
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
 * Controller unit tests for {@link SecurityPostureController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityPostureControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityPostureService postureService;

    @InjectMocks
    private SecurityPostureController postureController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(postureController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        PosturePolicyResponse response = PosturePolicyResponse.builder()
                .id(1L)
                .policyName("MASTER_POSTURE_POLICY")
                .activeBenchmarkStandard("CIS_BENCHMARK")
                .minimumScoreThreshold(85.0)
                .build();

        when(postureService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/posture/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("MASTER_POSTURE_POLICY"))
                .andExpect(jsonPath("$.activeBenchmarkStandard").value("CIS_BENCHMARK"));
    }

    @Test
    void runPostureEvaluation_Success() throws Exception {
        SecurityPostureEvaluationResponse response = SecurityPostureEvaluationResponse.builder()
                .evaluationId("POS-2026-8801")
                .benchmarkStandard("CIS_BENCHMARK")
                .overallPostureScore(95.0)
                .riskRating("OPTIMAL")
                .build();

        when(postureService.runPostureEvaluation(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/posture/evaluation/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(RunPostureEvaluationRequest.builder()
                                .benchmarkStandard("CIS_BENCHMARK")
                                .evaluationNotes("Test run")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evaluationId").value("POS-2026-8801"))
                .andExpect(jsonPath("$.riskRating").value("OPTIMAL"));
    }
}
