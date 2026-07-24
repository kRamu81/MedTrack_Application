package com.medtrack.auth.governance;

import com.medtrack.auth.governance.dto.*;
import com.medtrack.auth.governance.model.*;
import com.medtrack.auth.governance.repository.*;
import com.medtrack.auth.governance.service.SecurityGovernanceService;
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
 * Unit tests for {@link SecurityGovernanceService}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityGovernanceServiceTest {

    @Mock
    private SecurityGovernancePolicyRepository policyRepository;

    @Mock
    private ComplianceAuditReportRepository auditReportRepository;

    @Mock
    private SecurityComplianceControlRepository controlRepository;

    private SecurityGovernanceService governanceService;

    @BeforeEach
    void setUp() {
        governanceService = new SecurityGovernanceService(policyRepository, auditReportRepository, controlRepository);
    }

    @Test
    void getActivePolicy_Success() {
        SecurityGovernancePolicy policy = SecurityGovernancePolicy.builder()
                .id(1L)
                .policyName("ENTERPRISE_GOVERNANCE_POLICY")
                .hipaaComplianceEnabled(true)
                .soc2ComplianceEnabled(true)
                .strictMfaRequired(true)
                .passwordRotationDays(90)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("ENTERPRISE_GOVERNANCE_POLICY")).thenReturn(Optional.of(policy));

        GovernancePolicyResponse response = governanceService.getActivePolicy();

        assertNotNull(response);
        assertTrue(response.isHipaaComplianceEnabled());
        assertTrue(response.isStrictMfaRequired());
        assertEquals(90, response.getPasswordRotationDays());
    }

    @Test
    void runComplianceScan_AllPassed_ReturnsHighHealthScore() {
        SecurityGovernancePolicy policy = SecurityGovernancePolicy.builder()
                .hipaaComplianceEnabled(true)
                .soc2ComplianceEnabled(true)
                .gdprComplianceEnabled(true)
                .strictMfaRequired(true)
                .build();

        SecurityComplianceControl ctrl1 = SecurityComplianceControl.builder()
                .controlCode("HIPAA-164-312-A")
                .framework("HIPAA")
                .passed(true)
                .build();

        SecurityComplianceControl ctrl2 = SecurityComplianceControl.builder()
                .controlCode("SOC2-CC6-1")
                .framework("SOC2")
                .passed(true)
                .build();

        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(controlRepository.findAll()).thenReturn(List.of(ctrl1, ctrl2));
        when(auditReportRepository.save(any())).thenAnswer(i -> {
            ComplianceAuditReport report = i.getArgument(0);
            report.setId(1L);
            return report;
        });

        ComplianceAuditScanResponse scan = governanceService.runComplianceScan();

        assertNotNull(scan);
        assertEquals(100, scan.getComplianceScore());
        assertEquals(2, scan.getPassedControlsCount());
        assertEquals("COMPLIANT", scan.getOverallStatus());
    }

    @Test
    void updatePolicy_Success() {
        SecurityGovernancePolicy policy = SecurityGovernancePolicy.builder().build();
        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(policyRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        GovernancePolicyUpdateRequest request = GovernancePolicyUpdateRequest.builder()
                .policyName("ENTERPRISE_GOVERNANCE_POLICY")
                .hipaaComplianceEnabled(true)
                .soc2ComplianceEnabled(false)
                .passwordRotationDays(60)
                .sessionTimeoutMinutes(20)
                .auditLogRetentionDays(180)
                .strictMfaRequired(false)
                .build();

        GovernancePolicyResponse response = governanceService.updatePolicy(request);

        assertNotNull(response);
        assertFalse(response.isSoc2ComplianceEnabled());
        assertEquals(60, response.getPasswordRotationDays());
    }
}
