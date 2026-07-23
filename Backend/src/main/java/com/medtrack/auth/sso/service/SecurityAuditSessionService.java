package com.medtrack.auth.sso.service;

import com.medtrack.auth.sso.dto.SecurityRiskAnalysisResponse;
import com.medtrack.auth.sso.model.SecurityAuditSessionLog;
import com.medtrack.auth.sso.repository.SecurityAuditSessionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise Service managing security event audit logging and session threat risk scoring.
 */
@Service
@RequiredArgsConstructor
public class SecurityAuditSessionService {

    private final SecurityAuditSessionLogRepository auditLogRepository;

    /**
     * Records a security event log entry.
     */
    @Transactional
    public SecurityAuditSessionLog logSecurityEvent(
            Long userId,
            String userEmail,
            String eventType,
            String authMethod,
            String ipAddress,
            String userAgent,
            boolean suspicious,
            String notes) {

        int calculatedRiskScore = calculateEventRiskScore(eventType, authMethod, suspicious);

        SecurityAuditSessionLog log = SecurityAuditSessionLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .eventType(eventType)
                .authenticationMethod(authMethod)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .location("San Francisco, CA, US")
                .userAgent(userAgent != null ? userAgent : "Unknown Device")
                .riskScore(calculatedRiskScore)
                .suspiciousActivity(suspicious)
                .notes(notes)
                .timestamp(LocalDateTime.now())
                .build();

        return auditLogRepository.save(log);
    }

    /**
     * Evaluates security threat risk analysis for a user account.
     *
     * @param userId user identifier
     * @return {@link SecurityRiskAnalysisResponse} threat analysis overview
     */
    @Transactional(readOnly = true)
    public SecurityRiskAnalysisResponse evaluateSecurityRisk(Long userId) {
        List<SecurityAuditSessionLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
        List<String> anomalies = new ArrayList<>();
        int totalScore = 0;
        int suspiciousCount = 0;

        for (SecurityAuditSessionLog log : logs) {
            if (log.isSuspiciousActivity()) {
                suspiciousCount++;
                totalScore += log.getRiskScore();
                if (log.getNotes() != null) {
                    anomalies.add(log.getNotes());
                }
            }
        }

        int score = logs.isEmpty() ? 0 : Math.min(100, Math.max(5, (totalScore / (logs.size())) + (suspiciousCount * 15)));
        String riskLevel = score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";

        return SecurityRiskAnalysisResponse.builder()
                .userId(userId)
                .threatRiskScore(score)
                .riskLevel(riskLevel)
                .suspiciousEventCount(suspiciousCount)
                .detectedAnomalies(anomalies)
                .evaluatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Retrieves audit logs for a user.
     */
    @Transactional(readOnly = true)
    public List<SecurityAuditSessionLog> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    private int calculateEventRiskScore(String eventType, String authMethod, boolean suspicious) {
        if (suspicious) return 85;
        if ("LOGIN_FAILED".equalsIgnoreCase(eventType)) return 45;
        if ("RISK_ALERT".equalsIgnoreCase(eventType)) return 75;
        if ("SSO_REDIRECT".equalsIgnoreCase(eventType)) return 10;
        return 5;
    }
}
