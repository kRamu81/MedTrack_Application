package com.medtrack.auth.playbook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.playbook.controller.SecurityPlaybookController;
import com.medtrack.auth.playbook.dto.*;
import com.medtrack.auth.playbook.service.SecurityPlaybookService;
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
 * Controller unit tests for {@link SecurityPlaybookController}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityPlaybookControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityPlaybookService playbookService;

    @InjectMocks
    private SecurityPlaybookController playbookController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(playbookController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        PlaybookPolicyResponse response = PlaybookPolicyResponse.builder()
                .id(1L)
                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                .triggerEvent("BRUTE_FORCE")
                .defaultContainmentAction("REVOKE_TOKENS_AND_BAN_IP")
                .build();

        when(playbookService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/playbook/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playbookName").value("MASTER_CONTAINMENT_PLAYBOOK"))
                .andExpect(jsonPath("$.defaultContainmentAction").value("REVOKE_TOKENS_AND_BAN_IP"));
    }

    @Test
    void triggerPlaybookExecution_Success() throws Exception {
        SecurityPlaybookExecutionResponse response = SecurityPlaybookExecutionResponse.builder()
                .executionId("PLBK-EXEC-101")
                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                .executionStatus("SUCCESS")
                .build();

        when(playbookService.triggerPlaybookExecution(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/playbook/trigger")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(TriggerPlaybookExecutionRequest.builder()
                                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                                .triggerEvent("BRUTE_FORCE")
                                .affectedAsset("ip:192.168.1.105")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value("PLBK-EXEC-101"))
                .andExpect(jsonPath("$.executionStatus").value("SUCCESS"));
    }
}
