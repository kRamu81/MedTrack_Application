package com.medtrack.auth.zerotrust.service;

import com.medtrack.auth.zerotrust.dto.*;
import com.medtrack.auth.zerotrust.model.*;
import com.medtrack.auth.zerotrust.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Zero-Trust IP Threat Intelligence, Security Policy Enforcement,
 * and Real-Time Anomaly Rate Limiting.
 */
@Service
@RequiredArgsConstructor
public class ZeroTrustSecurityService {

    private final ZeroTrustPolicyRepository policyRepository;
    private final IpThreatReputationRepository reputationRepository;
    private final SecurityPolicyViolationRepository violationRepository;

    private static final String DEFAULT_POLICY_NAME = "DEFAULT_ZERO_TRUST_POLICY";

    /**
     * Seeds initial default zero-trust policy if not present.
     */
    @PostConstruct
    @Transactional
    public void seedDefaultPolicy() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            ZeroTrustPolicy policy = ZeroTrustPolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .ipWhitelistEnabled(false)
                    .geoFencingEnabled(true)
                    .maxFailedAttemptsThreshold(5)
                    .ipBlockDurationMinutes(30)
                    .anomalyDetectionEnabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }
    }

    /**
     * Gets the active zero-trust security policy.
     */
    @Transactional(readOnly = true)
    public ZeroTrustPolicyResponse getActivePolicy() {
        ZeroTrustPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates zero-trust security policy parameters.
     */
    @Transactional
    public ZeroTrustPolicyResponse updatePolicy(ZeroTrustPolicyUpdateRequest request) {
        ZeroTrustPolicy policy = getOrCreatePolicy();
        policy.setIpWhitelistEnabled(request.isIpWhitelistEnabled());
        policy.setGeoFencingEnabled(request.isGeoFencingEnabled());
        policy.setMaxFailedAttemptsThreshold(request.getMaxFailedAttemptsThreshold());
        policy.setIpBlockDurationMinutes(request.getIpBlockDurationMinutes());
        policy.setAnomalyDetectionEnabled(request.isAnomalyDetectionEnabled());
        policy.setUpdatedAt(LocalDateTime.now());

        ZeroTrustPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Evaluates IP threat level and checks if IP address is blocked or allowed under zero-trust rules.
     */
    @Transactional
    public IpThreatEvaluationResponse evaluateIpThreat(String ipAddress, String countryCode) {
        ZeroTrustPolicy policy = getOrCreatePolicy();
        Optional<IpThreatReputationLog> repOpt = reputationRepository.findByIpAddress(ipAddress);

        IpThreatReputationLog rep;
        if (repOpt.isPresent()) {
            rep = repOpt.get();
            rep.setLastSeenAt(LocalDateTime.now());
            if (countryCode != null) rep.setCountryCode(countryCode);
        } else {
            rep = IpThreatReputationLog.builder()
                    .ipAddress(ipAddress)
                    .countryCode(countryCode != null ? countryCode : "US")
                    .failedAttemptsCount(0)
                    .threatScore(10)
                    .threatLevel("LOW")
                    .blocked(false)
                    .lastSeenAt(LocalDateTime.now())
                    .build();
        }

        // Check block expiration
        if (rep.isBlocked() && rep.getBlockedUntil() != null && LocalDateTime.now().isAfter(rep.getBlockedUntil())) {
            rep.setBlocked(false);
            rep.setBlockedUntil(null);
            rep.setFailedAttemptsCount(0);
            rep.setThreatScore(Math.max(10, rep.getThreatScore() - 30));
            rep.setThreatLevel("LOW");
        }

        boolean shouldBlock = rep.isBlocked() || rep.getFailedAttemptsCount() >= policy.getMaxFailedAttemptsThreshold();
        if (shouldBlock && !rep.isBlocked()) {
            rep.setBlocked(true);
            rep.setBlockedUntil(LocalDateTime.now().plusMinutes(policy.getIpBlockDurationMinutes()));
            rep.setThreatScore(95);
            rep.setThreatLevel("CRITICAL");

            // Log security policy violation
            violationRepository.save(SecurityPolicyViolationLog.builder()
                    .ipAddress(ipAddress)
                    .violationType("IP_BLOCKED")
                    .severity("CRITICAL")
                    .description("IP address blocked due to exceeding max failed authentication attempts threshold ("
                            + policy.getMaxFailedAttemptsThreshold() + ")")
                    .resolved(false)
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        reputationRepository.save(rep);

        String decisionMessage = rep.isBlocked()
                ? "Access denied: IP address is currently blocked under zero-trust policy until " + rep.getBlockedUntil()
                : "Access granted under Zero-Trust rules.";

        return IpThreatEvaluationResponse.builder()
                .ipAddress(rep.getIpAddress())
                .countryCode(rep.getCountryCode())
                .threatScore(rep.getThreatScore())
                .threatLevel(rep.getThreatLevel())
                .blocked(rep.isBlocked())
                .blockedUntil(rep.getBlockedUntil())
                .failedAttemptsCount(rep.getFailedAttemptsCount())
                .decisionMessage(decisionMessage)
                .build();
    }

    /**
     * Records a failed login attempt for an IP address.
     */
    @Transactional
    public IpThreatEvaluationResponse recordFailedAttempt(String ipAddress) {
        ZeroTrustPolicy policy = getOrCreatePolicy();
        IpThreatReputationLog rep = reputationRepository.findByIpAddress(ipAddress)
                .orElseGet(() -> IpThreatReputationLog.builder()
                        .ipAddress(ipAddress)
                        .countryCode("US")
                        .failedAttemptsCount(0)
                        .threatScore(10)
                        .threatLevel("LOW")
                        .blocked(false)
                        .lastSeenAt(LocalDateTime.now())
                        .build());

        int newFailures = rep.getFailedAttemptsCount() + 1;
        rep.setFailedAttemptsCount(newFailures);
        rep.setLastSeenAt(LocalDateTime.now());

        int threatScore = Math.min(100, 10 + (newFailures * 18));
        rep.setThreatScore(threatScore);

        if (threatScore >= 80) {
            rep.setThreatLevel("CRITICAL");
        } else if (threatScore >= 50) {
            rep.setThreatLevel("HIGH");
        } else if (threatScore >= 30) {
            rep.setThreatLevel("MEDIUM");
        } else {
            rep.setThreatLevel("LOW");
        }

        if (newFailures >= policy.getMaxFailedAttemptsThreshold()) {
            rep.setBlocked(true);
            rep.setBlockedUntil(LocalDateTime.now().plusMinutes(policy.getIpBlockDurationMinutes()));
        }

        reputationRepository.save(rep);
        return evaluateIpThreat(ipAddress, rep.getCountryCode());
    }

    /**
     * Unblocks a blocked IP address manually.
     */
    @Transactional
    public IpThreatEvaluationResponse unblockIp(String ipAddress) {
        IpThreatReputationLog rep = reputationRepository.findByIpAddress(ipAddress)
                .orElseThrow(() -> new IllegalArgumentException("IP address reputation record not found: " + ipAddress));

        rep.setBlocked(false);
        rep.setBlockedUntil(null);
        rep.setFailedAttemptsCount(0);
        rep.setThreatScore(10);
        rep.setThreatLevel("LOW");

        reputationRepository.save(rep);
        return evaluateIpThreat(ipAddress, rep.getCountryCode());
    }

    /**
     * Retrieves all recorded IP threat logs.
     */
    @Transactional(readOnly = true)
    public List<IpThreatEvaluationResponse> getAllIpThreatLogs() {
        return reputationRepository.findAll().stream()
                .map(rep -> IpThreatEvaluationResponse.builder()
                        .ipAddress(rep.getIpAddress())
                        .countryCode(rep.getCountryCode())
                        .threatScore(rep.getThreatScore())
                        .threatLevel(rep.getThreatLevel())
                        .blocked(rep.isBlocked())
                        .blockedUntil(rep.getBlockedUntil())
                        .failedAttemptsCount(rep.getFailedAttemptsCount())
                        .decisionMessage(rep.isBlocked() ? "IP Blocked" : "Active")
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all security policy violations.
     */
    @Transactional(readOnly = true)
    public List<SecurityPolicyViolationResponse> getAllViolations() {
        return violationRepository.findAll().stream()
                .map(v -> SecurityPolicyViolationResponse.builder()
                        .id(v.getId())
                        .userId(v.getUserId())
                        .username(v.getUsername())
                        .ipAddress(v.getIpAddress())
                        .violationType(v.getViolationType())
                        .severity(v.getSeverity())
                        .description(v.getDescription())
                        .resolved(v.isResolved())
                        .timestamp(v.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }

    private ZeroTrustPolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(ZeroTrustPolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .ipWhitelistEnabled(false)
                        .geoFencingEnabled(true)
                        .maxFailedAttemptsThreshold(5)
                        .ipBlockDurationMinutes(30)
                        .anomalyDetectionEnabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private ZeroTrustPolicyResponse mapToPolicyResponse(ZeroTrustPolicy policy) {
        return ZeroTrustPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .ipWhitelistEnabled(policy.isIpWhitelistEnabled())
                .geoFencingEnabled(policy.isGeoFencingEnabled())
                .maxFailedAttemptsThreshold(policy.getMaxFailedAttemptsThreshold())
                .ipBlockDurationMinutes(policy.getIpBlockDurationMinutes())
                .anomalyDetectionEnabled(policy.isAnomalyDetectionEnabled())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
