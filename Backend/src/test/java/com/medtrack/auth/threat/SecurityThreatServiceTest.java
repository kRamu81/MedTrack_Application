package com.medtrack.auth.threat;

import com.medtrack.auth.threat.dto.*;
import com.medtrack.auth.threat.model.*;
import com.medtrack.auth.threat.repository.*;
import com.medtrack.auth.threat.service.SecurityThreatService;
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
 * Unit tests for {@link SecurityThreatService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityThreatServiceTest {

    @Mock
    private SecurityThreatPolicyRepository policyRepository;

    @Mock
    private SecurityThreatIncidentRepository incidentRepository;

    @Mock
    private ThreatContainmentActionRepository containmentActionRepository;

    private SecurityThreatService threatService;

    @BeforeEach
    void setUp() {
        threatService = new SecurityThreatService(policyRepository, incidentRepository, containmentActionRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityThreatPolicy policy = SecurityThreatPolicy.builder()
                .id(1L)
                .policyName("MASTER_THREAT_POLICY")
                .maxFailedLoginsPerMinute(5)
                .anomalyRiskThreshold(75)
                .autoContainmentEnabled(true)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_THREAT_POLICY")).thenReturn(Optional.of(policy));

        ThreatPolicyResponse response = threatService.getActivePolicy();

        assertNotNull(response);
        assertEquals(5, response.getMaxFailedLoginsPerMinute());
        assertEquals(75, response.getAnomalyRiskThreshold());
        assertTrue(response.isAutoContainmentEnabled());
    }

    @Test
    void reportIncident_WithoutAutoContainment_Success() {
        SecurityThreatPolicy policy = SecurityThreatPolicy.builder()
                .anomalyRiskThreshold(75)
                .autoContainmentEnabled(false)
                .build();

        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(incidentRepository.save(any())).thenAnswer(i -> {
            SecurityThreatIncident inc = i.getArgument(0);
            inc.setId(1L);
            return inc;
        });

        ReportThreatIncidentRequest request = ReportThreatIncidentRequest.builder()
                .threatType("BRUTE_FORCE_BURST")
                .threatLevel("HIGH")
                .riskScore(85)
                .sourceIp("198.51.100.42")
                .targetUsername("admin@medtrack.org")
                .incidentDetails("Burst logins detected")
                .build();

        SecurityThreatIncidentResponse response = threatService.reportIncident(request);

        assertNotNull(response);
        assertEquals("BRUTE_FORCE_BURST", response.getThreatType());
        assertEquals("DETECTED", response.getStatus());
        assertEquals(85, response.getRiskScore());
    }

    @Test
    void executeContainment_Success() {
        SecurityThreatIncident incident = SecurityThreatIncident.builder()
                .id(1L)
                .incidentId("INC-2026-8801")
                .status("DETECTED")
                .build();

        when(incidentRepository.findByIncidentId("INC-2026-8801")).thenReturn(Optional.of(incident));
        when(containmentActionRepository.save(any())).thenAnswer(i -> {
            ThreatContainmentAction action = i.getArgument(0);
            action.setId(1L);
            return action;
        });

        ExecuteContainmentRequest request = ExecuteContainmentRequest.builder()
                .incidentId("INC-2026-8801")
                .actionType("ACCOUNT_LOCKOUT")
                .actionNotes("Manual SOC lockout")
                .build();

        ThreatContainmentActionResponse actionResponse = threatService.executeContainment(request, "SOC_ADMIN");

        assertNotNull(actionResponse);
        assertEquals("ACCOUNT_LOCKOUT", actionResponse.getActionType());
        assertEquals("EXECUTED", actionResponse.getStatus());
        assertEquals("CONTAINED", incident.getStatus());
    }
}
