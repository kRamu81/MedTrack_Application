package com.medtrack.auth.zerotrust;

import com.medtrack.auth.zerotrust.dto.*;
import com.medtrack.auth.zerotrust.model.*;
import com.medtrack.auth.zerotrust.repository.*;
import com.medtrack.auth.zerotrust.service.ZeroTrustSecurityService;
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
 * Unit tests for {@link ZeroTrustSecurityService}.
 */
@ExtendWith(MockitoExtension.class)
public class ZeroTrustSecurityServiceTest {

    @Mock
    private ZeroTrustPolicyRepository policyRepository;

    @Mock
    private IpThreatReputationRepository reputationRepository;

    @Mock
    private SecurityPolicyViolationRepository violationRepository;

    private ZeroTrustSecurityService zeroTrustService;

    @BeforeEach
    void setUp() {
        zeroTrustService = new ZeroTrustSecurityService(policyRepository, reputationRepository, violationRepository);
    }

    @Test
    void getActivePolicy_Success() {
        ZeroTrustPolicy policy = ZeroTrustPolicy.builder()
                .id(1L)
                .policyName("DEFAULT_ZERO_TRUST_POLICY")
                .geoFencingEnabled(true)
                .maxFailedAttemptsThreshold(5)
                .ipBlockDurationMinutes(30)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("DEFAULT_ZERO_TRUST_POLICY")).thenReturn(Optional.of(policy));

        ZeroTrustPolicyResponse response = zeroTrustService.getActivePolicy();

        assertNotNull(response);
        assertTrue(response.isGeoFencingEnabled());
        assertEquals(5, response.getMaxFailedAttemptsThreshold());
    }

    @Test
    void evaluateIpThreat_UnblockedIp_ReturnsAllowed() {
        ZeroTrustPolicy policy = ZeroTrustPolicy.builder()
                .maxFailedAttemptsThreshold(5)
                .ipBlockDurationMinutes(30)
                .build();

        IpThreatReputationLog log = IpThreatReputationLog.builder()
                .ipAddress("192.168.1.50")
                .countryCode("US")
                .failedAttemptsCount(2)
                .threatScore(30)
                .threatLevel("MEDIUM")
                .blocked(false)
                .build();

        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(reputationRepository.findByIpAddress("192.168.1.50")).thenReturn(Optional.of(log));
        when(reputationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        IpThreatEvaluationResponse response = zeroTrustService.evaluateIpThreat("192.168.1.50", "US");

        assertNotNull(response);
        assertFalse(response.isBlocked());
        assertEquals("MEDIUM", response.getThreatLevel());
    }

    @Test
    void recordFailedAttempt_ThresholdExceeded_BlocksIp() {
        ZeroTrustPolicy policy = ZeroTrustPolicy.builder()
                .maxFailedAttemptsThreshold(3)
                .ipBlockDurationMinutes(30)
                .build();

        IpThreatReputationLog log = IpThreatReputationLog.builder()
                .ipAddress("10.0.0.1")
                .countryCode("US")
                .failedAttemptsCount(2)
                .threatScore(40)
                .threatLevel("MEDIUM")
                .blocked(false)
                .build();

        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(reputationRepository.findByIpAddress("10.0.0.1")).thenReturn(Optional.of(log));
        when(reputationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        IpThreatEvaluationResponse response = zeroTrustService.recordFailedAttempt("10.0.0.1");

        assertNotNull(response);
        assertTrue(response.isBlocked());
        assertEquals(3, response.getFailedAttemptsCount());
    }

    @Test
    void unblockIp_Success() {
        ZeroTrustPolicy policy = ZeroTrustPolicy.builder().maxFailedAttemptsThreshold(5).build();

        IpThreatReputationLog log = IpThreatReputationLog.builder()
                .ipAddress("10.0.0.1")
                .countryCode("US")
                .failedAttemptsCount(5)
                .threatScore(95)
                .threatLevel("CRITICAL")
                .blocked(true)
                .build();

        when(policyRepository.findByPolicyName(any())).thenReturn(Optional.of(policy));
        when(reputationRepository.findByIpAddress("10.0.0.1")).thenReturn(Optional.of(log));
        when(reputationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        IpThreatEvaluationResponse response = zeroTrustService.unblockIp("10.0.0.1");

        assertNotNull(response);
        assertFalse(response.isBlocked());
        assertEquals(0, response.getFailedAttemptsCount());
        assertEquals("LOW", response.getThreatLevel());
    }
}
