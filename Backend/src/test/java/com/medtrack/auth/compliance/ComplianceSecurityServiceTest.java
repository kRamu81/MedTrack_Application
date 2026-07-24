package com.medtrack.auth.compliance;

import com.medtrack.auth.compliance.dto.*;
import com.medtrack.auth.compliance.model.*;
import com.medtrack.auth.compliance.repository.*;
import com.medtrack.auth.compliance.service.ComplianceSecurityService;
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
 * Unit tests for {@link ComplianceSecurityService}.
 */
@ExtendWith(MockitoExtension.class)
public class ComplianceSecurityServiceTest {

    @Mock
    private CompliancePolicyRepository policyRepository;

    @Mock
    private ComplianceAuditReportRepository auditReportRepository;

    @Mock
    private ComplianceControlItemRepository controlItemRepository;

    private ComplianceSecurityService complianceService;

    @BeforeEach
    void setUp() {
        complianceService = new ComplianceSecurityService(policyRepository, auditReportRepository, controlItemRepository);
    }

    @Test
    void getActivePolicy_Success() {
        CompliancePolicy policy = CompliancePolicy.builder()
                .id(1L)
                .policyName("MASTER_COMPLIANCE_POLICY")
                .activeFramework("SOC2_TYPE2")
                .dataRetentionDays(365)
                .autoAuditScheduled(true)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_COMPLIANCE_POLICY")).thenReturn(Optional.of(policy));

        CompliancePolicyResponse response = complianceService.getActivePolicy();

        assertNotNull(response);
        assertEquals("SOC2_TYPE2", response.getActiveFramework());
        assertEquals(365, response.getDataRetentionDays());
    }

    @Test
    void runComplianceAudit_Success() {
        ComplianceControlItem item1 = ComplianceControlItem.builder()
                .controlCode("SOC2-CC6.1")
                .framework("SOC2_TYPE2")
                .status("COMPLIANT")
                .build();

        when(controlItemRepository.findByFramework("SOC2_TYPE2")).thenReturn(List.of(item1));
        when(auditReportRepository.save(any())).thenAnswer(i -> {
            ComplianceAuditReport report = i.getArgument(0);
            report.setId(1L);
            return report;
        });

        RunComplianceAuditRequest request = RunComplianceAuditRequest.builder()
                .frameworkStandard("SOC2_TYPE2")
                .evaluatorNotes("Annual SOC2 evaluation run")
                .build();

        ComplianceAuditReportResponse response = complianceService.runComplianceAudit(request, "AUDITOR");

        assertNotNull(response);
        assertEquals("SOC2_TYPE2", response.getFrameworkStandard());
        assertEquals(100.0, response.getComplianceScorePercentage());
        assertEquals("PASS", response.getStatus());
    }

    @Test
    void recordControlEvidence_Success() {
        when(controlItemRepository.save(any())).thenAnswer(i -> {
            ComplianceControlItem item = i.getArgument(0);
            item.setId(1L);
            return item;
        });

        RecordControlEvidenceRequest request = RecordControlEvidenceRequest.builder()
                .controlCode("HIPAA-164.312")
                .controlName("PHI Access Encryption")
                .framework("HIPAA_HITECH")
                .status("COMPLIANT")
                .evidenceDetails("KeyVault AES-256 enabled")
                .build();

        ComplianceControlItemResponse response = complianceService.recordControlEvidence(request);

        assertNotNull(response);
        assertEquals("HIPAA-164.312", response.getControlCode());
        assertEquals("COMPLIANT", response.getStatus());
    }
}
