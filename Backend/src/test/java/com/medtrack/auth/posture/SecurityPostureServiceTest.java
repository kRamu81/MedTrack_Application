package com.medtrack.auth.posture;

import com.medtrack.auth.posture.dto.*;
import com.medtrack.auth.posture.model.*;
import com.medtrack.auth.posture.repository.*;
import com.medtrack.auth.posture.service.SecurityPostureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link SecurityPostureService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityPostureServiceTest {

    @Mock
    private SecurityPosturePolicyRepository policyRepository;

    @Mock
    private SecurityPostureEvaluationRepository evaluationRepository;

    @Mock
    private PostureControlAssessmentRepository controlAssessmentRepository;

    private SecurityPostureService postureService;

    @BeforeEach
    void setUp() {
        postureService = new SecurityPostureService(policyRepository, evaluationRepository, controlAssessmentRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityPosturePolicy policy = SecurityPosturePolicy.builder()
                .id(1L)
                .policyName("MASTER_POSTURE_POLICY")
                .activeBenchmarkStandard("CIS_BENCHMARK")
                .minimumScoreThreshold(85.0)
                .automatedAssessmentEnabled(true)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_POSTURE_POLICY")).thenReturn(Optional.of(policy));

        PosturePolicyResponse response = postureService.getActivePolicy();

        assertNotNull(response);
        assertEquals("CIS_BENCHMARK", response.getActiveBenchmarkStandard());
        assertEquals(85.0, response.getMinimumScoreThreshold());
    }

    @Test
    void runPostureEvaluation_Success() {
        PostureControlAssessment check1 = PostureControlAssessment.builder()
                .controlId("CIS-1.1")
                .domainCategory("IAM_GOVERNANCE")
                .complianceStatus("COMPLIANT")
                .build();

        when(controlAssessmentRepository.findAll()).thenReturn(List.of(check1));
        when(evaluationRepository.save(any())).thenAnswer(i -> {
            SecurityPostureEvaluation e = i.getArgument(0);
            e.setId(1L);
            return e;
        });

        RunPostureEvaluationRequest request = RunPostureEvaluationRequest.builder()
                .benchmarkStandard("CIS_BENCHMARK")
                .evaluationNotes("Scheduled evaluation run")
                .build();

        SecurityPostureEvaluationResponse response = postureService.runPostureEvaluation(request, "AUDITOR");

        assertNotNull(response);
        assertEquals("CIS_BENCHMARK", response.getBenchmarkStandard());
        assertEquals(100.0, response.getOverallPostureScore());
        assertEquals("OPTIMAL", response.getRiskRating());
    }

    @Test
    void recordPostureCheck_Success() {
        when(controlAssessmentRepository.save(any())).thenAnswer(i -> {
            PostureControlAssessment a = i.getArgument(0);
            a.setId(1L);
            return a;
        });

        RecordPostureCheckRequest request = RecordPostureCheckRequest.builder()
                .controlId("NIST-AC-2")
                .controlName("Account Management & Review")
                .domainCategory("IAM_GOVERNANCE")
                .complianceStatus("COMPLIANT")
                .evidenceDetails("RBAC role audit verified")
                .build();

        PostureControlAssessmentResponse response = postureService.recordPostureCheck(request);

        assertNotNull(response);
        assertEquals("NIST-AC-2", response.getControlId());
        assertEquals("COMPLIANT", response.getComplianceStatus());
    }
}
