package com.medtrack.auth.playbook;

import com.medtrack.auth.playbook.dto.*;
import com.medtrack.auth.playbook.model.*;
import com.medtrack.auth.playbook.repository.*;
import com.medtrack.auth.playbook.service.SecurityPlaybookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SecurityPlaybookService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityPlaybookServiceTest {

    @Mock
    private SecurityPlaybookPolicyRepository policyRepository;

    @Mock
    private SecurityPlaybookExecutionRepository executionRepository;

    @Mock
    private PlaybookStepResultRepository stepResultRepository;

    private SecurityPlaybookService playbookService;

    @BeforeEach
    void setUp() {
        playbookService = new SecurityPlaybookService(policyRepository, executionRepository, stepResultRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityPlaybookPolicy policy = SecurityPlaybookPolicy.builder()
                .id(1L)
                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                .triggerEvent("BRUTE_FORCE")
                .defaultContainmentAction("REVOKE_TOKENS_AND_BAN_IP")
                .executionMode("AUTOMATIC")
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPlaybookName("MASTER_CONTAINMENT_PLAYBOOK")).thenReturn(Optional.of(policy));

        PlaybookPolicyResponse response = playbookService.getActivePolicy();

        assertNotNull(response);
        assertEquals("REVOKE_TOKENS_AND_BAN_IP", response.getDefaultContainmentAction());
        assertEquals("AUTOMATIC", response.getExecutionMode());
    }

    @Test
    void triggerPlaybookExecution_Success() {
        SecurityPlaybookPolicy policy = SecurityPlaybookPolicy.builder()
                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                .defaultContainmentAction("REVOKE_TOKENS_AND_BAN_IP")
                .build();

        when(policyRepository.findByPlaybookName(any())).thenReturn(Optional.of(policy));
        when(executionRepository.save(any())).thenAnswer(i -> {
            SecurityPlaybookExecution e = i.getArgument(0);
            e.setId(1L);
            return e;
        });

        TriggerPlaybookExecutionRequest request = TriggerPlaybookExecutionRequest.builder()
                .playbookName("MASTER_CONTAINMENT_PLAYBOOK")
                .triggerEvent("BRUTE_FORCE")
                .affectedAsset("ip:192.168.1.105")
                .build();

        SecurityPlaybookExecutionResponse response = playbookService.triggerPlaybookExecution(request, "SOAR_BOT");

        assertNotNull(response);
        assertEquals("ip:192.168.1.105", response.getAffectedAsset());
        assertEquals("SUCCESS", response.getExecutionStatus());
    }

    @Test
    void recordPlaybookStep_Success() {
        when(stepResultRepository.save(any())).thenAnswer(i -> {
            PlaybookStepResult s = i.getArgument(0);
            s.setId(1L);
            return s;
        });

        RecordPlaybookStepRequest request = RecordPlaybookStepRequest.builder()
                .executionId("PLBK-EXEC-101")
                .stepId("STEP-01")
                .stepName("REVOKE_JWT_TOKENS")
                .stepStatus("COMPLETED")
                .stepDetails("Revoked tokens")
                .build();

        PlaybookStepResultResponse response = playbookService.recordPlaybookStep(request);

        assertNotNull(response);
        assertEquals("STEP-01", response.getStepId());
        assertEquals("COMPLETED", response.getStepStatus());
    }
}
