package com.medtrack.auth.evidence;

import com.medtrack.auth.evidence.dto.*;
import com.medtrack.auth.evidence.model.*;
import com.medtrack.auth.evidence.repository.*;
import com.medtrack.auth.evidence.service.ComplianceEvidenceService;
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
 * Unit tests for {@link ComplianceEvidenceService}.
 */
@ExtendWith(MockitoExtension.class)
public class ComplianceEvidenceServiceTest {

    @Mock
    private ComplianceEvidencePolicyRepository policyRepository;

    @Mock
    private ComplianceEvidenceRecordRepository recordRepository;

    @Mock
    private EvidenceAuditChainLogRepository chainLogRepository;

    private ComplianceEvidenceService evidenceService;

    @BeforeEach
    void setUp() {
        evidenceService = new ComplianceEvidenceService(policyRepository, recordRepository, chainLogRepository);
    }

    @Test
    void getActivePolicy_Success() {
        ComplianceEvidencePolicy policy = ComplianceEvidencePolicy.builder()
                .id(1L)
                .policyName("MASTER_EVIDENCE_POLICY")
                .defaultFrameworkStandard("SOC2")
                .hashAlgorithm("SHA-256")
                .wormStorageEnabled(true)
                .retentionYears(7)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_EVIDENCE_POLICY")).thenReturn(Optional.of(policy));

        EvidencePolicyResponse response = evidenceService.getActivePolicy();

        assertNotNull(response);
        assertEquals("SOC2", response.getDefaultFrameworkStandard());
        assertTrue(response.isWormStorageEnabled());
    }

    @Test
    void ingestEvidenceRecord_Success() {
        when(recordRepository.save(any())).thenAnswer(i -> {
            ComplianceEvidenceRecord r = i.getArgument(0);
            r.setId(1L);
            return r;
        });

        IngestEvidenceRecordRequest request = IngestEvidenceRecordRequest.builder()
                .frameworkStandard("SOC2")
                .controlReference("CC6.1")
                .evidenceType("LOG_EXPORT")
                .storageUri("s3://medtrack-vault/evd-01.log")
                .evidenceDescription("Access control audit log export")
                .build();

        ComplianceEvidenceRecordResponse response = evidenceService.ingestEvidenceRecord(request, "AUDITOR_ALICE");

        assertNotNull(response);
        assertEquals("SOC2", response.getFrameworkStandard());
        assertEquals("VERIFIED", response.getVerificationStatus());
        assertNotNull(response.getFileHashSha256());
    }

    @Test
    void verifyEvidenceChain_Success() {
        EvidenceAuditChainLog chainLog = EvidenceAuditChainLog.builder()
                .id(1L)
                .blockIndex(1L)
                .currentHash("a1b2c3d4")
                .previousHash("00000000")
                .evidenceId("EVD-8801")
                .ledgerStatus("SEALED")
                .timestamp(LocalDateTime.now())
                .build();

        when(chainLogRepository.findByEvidenceId("EVD-8801")).thenReturn(Optional.of(chainLog));

        VerifyEvidenceChainRequest request = VerifyEvidenceChainRequest.builder()
                .evidenceId("EVD-8801")
                .build();

        EvidenceAuditChainLogResponse response = evidenceService.verifyEvidenceChain(request);

        assertNotNull(response);
        assertEquals("EVD-8801", response.getEvidenceId());
        assertEquals("SEALED", response.getLedgerStatus());
    }
}
