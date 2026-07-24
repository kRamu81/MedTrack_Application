package com.medtrack.auth.threat.service;

import com.medtrack.auth.threat.dto.*;
import com.medtrack.auth.threat.model.*;
import com.medtrack.auth.threat.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Threat Intelligence, Real-time Risk Evaluation, and Automated SOAR Containment Workflows.
 */
@Service
@RequiredArgsConstructor
public class SecurityThreatService {

    private final SecurityThreatPolicyRepository policyRepository;
    private final SecurityThreatIncidentRepository incidentRepository;
    private final ThreatContainmentActionRepository containmentActionRepository;

    private static final String DEFAULT_POLICY_NAME = "MASTER_THREAT_POLICY";

    /**
     * Seeds initial threat detection policy and baseline security incidents.
     */
    @PostConstruct
    @Transactional
    public void seedThreatPolicyAndBaseline() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            SecurityThreatPolicy policy = SecurityThreatPolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .maxFailedLoginsPerMinute(5)
                    .anomalyRiskThreshold(75)
                    .autoContainmentEnabled(true)
                    .notifySecurityOperationsCenter(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        seedDefaultIncident("INC-2026-8801", "BRUTE_FORCE_BURST", "HIGH", 85, "198.51.100.42", "admin@medtrack.org",
                "Multiple failed login attempts detected within 30 seconds.");
        seedDefaultIncident("INC-2026-8802", "ANOMALOUS_GEOLOCATION", "MEDIUM", 65, "203.0.113.19", "dr.smith@medtrack.org",
                "Concurrent session initialized from geographically impossible distance.");
    }

    private void seedDefaultIncident(String incId, String type, String level, int riskScore, String ip, String user, String details) {
        if (incidentRepository.findByIncidentId(incId).isEmpty()) {
            incidentRepository.save(SecurityThreatIncident.builder()
                    .incidentId(incId)
                    .threatType(type)
                    .threatLevel(level)
                    .riskScore(riskScore)
                    .sourceIp(ip)
                    .targetUsername(user)
                    .status("DETECTED")
                    .incidentDetails(details)
                    .detectedAt(LocalDateTime.now().minusHours(3))
                    .build());
        }
    }

    /**
     * Retrieves active threat detection policy.
     */
    @Transactional(readOnly = true)
    public ThreatPolicyResponse getActivePolicy() {
        SecurityThreatPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates security threat policy.
     */
    @Transactional
    public ThreatPolicyResponse updatePolicy(ThreatPolicyUpdateRequest request) {
        SecurityThreatPolicy policy = getOrCreatePolicy();
        policy.setMaxFailedLoginsPerMinute(request.getMaxFailedLoginsPerMinute());
        policy.setAnomalyRiskThreshold(request.getAnomalyRiskThreshold());
        policy.setAutoContainmentEnabled(request.isAutoContainmentEnabled());
        policy.setNotifySecurityOperationsCenter(request.isNotifySecurityOperationsCenter());
        policy.setUpdatedAt(LocalDateTime.now());

        SecurityThreatPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Reports or ingests a new security threat incident.
     */
    @Transactional
    public SecurityThreatIncidentResponse reportIncident(ReportThreatIncidentRequest request) {
        SecurityThreatPolicy policy = getOrCreatePolicy();
        String incId = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SecurityThreatIncident incident = SecurityThreatIncident.builder()
                .incidentId(incId)
                .threatType(request.getThreatType().toUpperCase())
                .threatLevel(request.getThreatLevel().toUpperCase())
                .riskScore(request.getRiskScore())
                .sourceIp(request.getSourceIp() != null ? request.getSourceIp() : "127.0.0.1")
                .targetUsername(request.getTargetUsername() != null ? request.getTargetUsername() : "SYSTEM")
                .status("DETECTED")
                .incidentDetails(request.getIncidentDetails())
                .detectedAt(LocalDateTime.now())
                .build();

        SecurityThreatIncident saved = incidentRepository.save(incident);

        // Auto-containment workflow if risk score exceeds threshold and auto containment is enabled
        if (policy.isAutoContainmentEnabled() && request.getRiskScore() >= policy.getAnomalyRiskThreshold()) {
            executeContainment(ExecuteContainmentRequest.builder()
                    .incidentId(saved.getIncidentId())
                    .actionType(request.getRiskScore() >= 90 ? "IP_BAN" : "ACCOUNT_LOCKOUT")
                    .actionNotes("Automated SOAR response triggered by risk score (" + request.getRiskScore() + ")")
                    .build(), "AUTOMATED_SOAR_ENGINE");
        }

        return mapToIncidentResponse(saved);
    }

    /**
     * Executes SOAR incident containment action.
     */
    @Transactional
    public ThreatContainmentActionResponse executeContainment(ExecuteContainmentRequest request, String executor) {
        SecurityThreatIncident incident = incidentRepository.findByIncidentId(request.getIncidentId())
                .orElseThrow(() -> new IllegalArgumentException("Incident ID not found: " + request.getIncidentId()));

        incident.setStatus("CONTAINED");
        incidentRepository.save(incident);

        ThreatContainmentAction action = ThreatContainmentAction.builder()
                .incidentId(request.getIncidentId())
                .actionType(request.getActionType().toUpperCase())
                .executedBy(executor != null ? executor : "SOC_ADMIN")
                .status("EXECUTED")
                .actionNotes(request.getActionNotes() != null ? request.getActionNotes() : "Executed " + request.getActionType())
                .executedAt(LocalDateTime.now())
                .build();

        ThreatContainmentAction saved = containmentActionRepository.save(action);

        return ThreatContainmentActionResponse.builder()
                .id(saved.getId())
                .incidentId(saved.getIncidentId())
                .actionType(saved.getActionType())
                .executedBy(saved.getExecutedBy())
                .status(saved.getStatus())
                .actionNotes(saved.getActionNotes())
                .executedAt(saved.getExecutedAt())
                .build();
    }

    /**
     * Resolves an incident manually.
     */
    @Transactional
    public SecurityThreatIncidentResponse resolveIncident(String incidentId) {
        SecurityThreatIncident incident = incidentRepository.findByIncidentId(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident ID not found: " + incidentId));

        incident.setStatus("RESOLVED");
        incident.setResolvedAt(LocalDateTime.now());

        SecurityThreatIncident saved = incidentRepository.save(incident);
        return mapToIncidentResponse(saved);
    }

    /**
     * Retrieves all recorded threat incidents.
     */
    @Transactional(readOnly = true)
    public List<SecurityThreatIncidentResponse> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(this::mapToIncidentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all SOAR containment action audit logs.
     */
    @Transactional(readOnly = true)
    public List<ThreatContainmentActionResponse> getAllContainmentActions() {
        return containmentActionRepository.findAll().stream()
                .map(act -> ThreatContainmentActionResponse.builder()
                        .id(act.getId())
                        .incidentId(act.getIncidentId())
                        .actionType(act.getActionType())
                        .executedBy(act.getExecutedBy())
                        .status(act.getStatus())
                        .actionNotes(act.getActionNotes())
                        .executedAt(act.getExecutedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private SecurityThreatPolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(SecurityThreatPolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .maxFailedLoginsPerMinute(5)
                        .anomalyRiskThreshold(75)
                        .autoContainmentEnabled(true)
                        .notifySecurityOperationsCenter(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private ThreatPolicyResponse mapToPolicyResponse(SecurityThreatPolicy policy) {
        return ThreatPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .maxFailedLoginsPerMinute(policy.getMaxFailedLoginsPerMinute())
                .anomalyRiskThreshold(policy.getAnomalyRiskThreshold())
                .autoContainmentEnabled(policy.isAutoContainmentEnabled())
                .notifySecurityOperationsCenter(policy.isNotifySecurityOperationsCenter())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private SecurityThreatIncidentResponse mapToIncidentResponse(SecurityThreatIncident inc) {
        return SecurityThreatIncidentResponse.builder()
                .id(inc.getId())
                .incidentId(inc.getIncidentId())
                .threatType(inc.getThreatType())
                .threatLevel(inc.getThreatLevel())
                .riskScore(inc.getRiskScore())
                .sourceIp(inc.getSourceIp())
                .targetUsername(inc.getTargetUsername())
                .status(inc.getStatus())
                .incidentDetails(inc.getIncidentDetails())
                .detectedAt(inc.getDetectedAt())
                .resolvedAt(inc.getResolvedAt())
                .build();
    }
}
