package com.medtrack.auth.governance.service;

import com.medtrack.auth.governance.dto.*;
import com.medtrack.auth.governance.model.*;
import com.medtrack.auth.governance.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Security Governance, Compliance Frameworks (HIPAA, SOC2, GDPR, ISO27001),
 * and Automated Security Posture Health Scans.
 */
@Service
@RequiredArgsConstructor
public class SecurityGovernanceService {

    private final SecurityGovernancePolicyRepository policyRepository;
    private final ComplianceAuditReportRepository auditReportRepository;
    private final SecurityComplianceControlRepository controlRepository;

    private static final String DEFAULT_POLICY_NAME = "ENTERPRISE_GOVERNANCE_POLICY";

    /**
     * Seeds initial governance policies and compliance controls.
     */
    @PostConstruct
    @Transactional
    public void seedInitialControls() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            SecurityGovernancePolicy policy = SecurityGovernancePolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .hipaaComplianceEnabled(true)
                    .soc2ComplianceEnabled(true)
                    .gdprComplianceEnabled(true)
                    .passwordRotationDays(90)
                    .sessionTimeoutMinutes(15)
                    .auditLogRetentionDays(365)
                    .strictMfaRequired(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        seedDefaultControl("HIPAA-164-312-A", "Access Control & Unique User Identification", "HIPAA",
                "Ensure unique user IDs and automatic logoff mechanisms.", true, "CRITICAL");
        seedDefaultControl("HIPAA-164-312-B", "Audit Controls & Security Logging", "HIPAA",
                "Implement hardware, software, and procedural mechanisms that record activity.", true, "HIGH");
        seedDefaultControl("SOC2-CC6-1", "Logical Access Security Boundaries", "SOC2",
                "Enforce role-based access control and multi-factor authentication.", true, "CRITICAL");
        seedDefaultControl("SOC2-CC6-8", "Malicious Software & Threat Prevention", "SOC2",
                "Deploy automated rate limiting and threat detection rules.", true, "HIGH");
        seedDefaultControl("GDPR-ART-32", "Security of Personal Data Processing", "GDPR",
                "Implement pseudonymization, encryption, and confidentiality controls.", true, "HIGH");
        seedDefaultControl("ISO27001-A9", "Access Control & Authority Governance", "ISO27001",
                "Limit access to information assets according to defined access policies.", true, "MEDIUM");
    }

    private void seedDefaultControl(String code, String name, String framework, String desc, boolean passed, String severity) {
        if (controlRepository.findByControlCode(code).isEmpty()) {
            controlRepository.save(SecurityComplianceControl.builder()
                    .controlCode(code)
                    .controlName(name)
                    .framework(framework)
                    .description(desc)
                    .passed(passed)
                    .severity(severity)
                    .lastEvaluatedAt(LocalDateTime.now())
                    .build());
        }
    }

    /**
     * Gets the current active governance policy.
     */
    @Transactional(readOnly = true)
    public GovernancePolicyResponse getActivePolicy() {
        SecurityGovernancePolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates security governance policy settings.
     */
    @Transactional
    public GovernancePolicyResponse updatePolicy(GovernancePolicyUpdateRequest request) {
        SecurityGovernancePolicy policy = getOrCreatePolicy();
        policy.setHipaaComplianceEnabled(request.isHipaaComplianceEnabled());
        policy.setSoc2ComplianceEnabled(request.isSoc2ComplianceEnabled());
        policy.setGdprComplianceEnabled(request.isGdprComplianceEnabled());
        policy.setPasswordRotationDays(request.getPasswordRotationDays());
        policy.setSessionTimeoutMinutes(request.getSessionTimeoutMinutes());
        policy.setAuditLogRetentionDays(request.getAuditLogRetentionDays());
        policy.setStrictMfaRequired(request.isStrictMfaRequired());
        policy.setUpdatedAt(LocalDateTime.now());

        SecurityGovernancePolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Triggers an automated system-wide compliance audit scan.
     */
    @Transactional
    public ComplianceAuditScanResponse runComplianceScan() {
        SecurityGovernancePolicy policy = getOrCreatePolicy();
        List<SecurityComplianceControl> controls = controlRepository.findAll();

        int total = controls.size();
        int passedCount = 0;

        for (SecurityComplianceControl ctrl : controls) {
            boolean isPassed = true;
            if ("HIPAA".equalsIgnoreCase(ctrl.getFramework()) && !policy.isHipaaComplianceEnabled()) {
                isPassed = false;
            } else if ("SOC2".equalsIgnoreCase(ctrl.getFramework()) && !policy.isSoc2ComplianceEnabled()) {
                isPassed = false;
            } else if ("GDPR".equalsIgnoreCase(ctrl.getFramework()) && !policy.isGdprComplianceEnabled()) {
                isPassed = false;
            } else if ("SOC2-CC6-1".equals(ctrl.getControlCode()) && !policy.isStrictMfaRequired()) {
                isPassed = false;
            }

            ctrl.setPassed(isPassed);
            ctrl.setLastEvaluatedAt(LocalDateTime.now());
            controlRepository.save(ctrl);

            if (isPassed) passedCount++;
        }

        int failedCount = total - passedCount;
        int score = total > 0 ? (passedCount * 100) / total : 100;

        String status = score >= 85 ? "COMPLIANT" : score >= 60 ? "WARNING" : "NON_COMPLIANT";
        String summary = String.format("Automated compliance scan evaluated %d controls. Passed: %d, Failed: %d. Health Posture: %d%%.",
                total, passedCount, failedCount, score);

        ComplianceAuditReport report = ComplianceAuditReport.builder()
                .scanTitle("Automated System Security Audit - " + LocalDateTime.now().toLocalDate())
                .complianceScore(score)
                .totalControlsEvaluated(total)
                .passedControlsCount(passedCount)
                .failedControlsCount(failedCount)
                .overallStatus(status)
                .summaryDetails(summary)
                .scannedAt(LocalDateTime.now())
                .build();

        ComplianceAuditReport saved = auditReportRepository.save(report);

        return ComplianceAuditScanResponse.builder()
                .id(saved.getId())
                .scanTitle(saved.getScanTitle())
                .complianceScore(saved.getComplianceScore())
                .totalControlsEvaluated(saved.getTotalControlsEvaluated())
                .passedControlsCount(saved.getPassedControlsCount())
                .failedControlsCount(saved.getFailedControlsCount())
                .overallStatus(saved.getOverallStatus())
                .summaryDetails(saved.getSummaryDetails())
                .scannedAt(saved.getScannedAt())
                .build();
    }

    /**
     * Retrieves all evaluated compliance controls.
     */
    @Transactional(readOnly = true)
    public List<ComplianceControlResponse> getAllControls() {
        return controlRepository.findAll().stream()
                .map(c -> ComplianceControlResponse.builder()
                        .id(c.getId())
                        .controlCode(c.getControlCode())
                        .controlName(c.getControlName())
                        .framework(c.getFramework())
                        .description(c.getDescription())
                        .passed(c.isPassed())
                        .severity(c.getSeverity())
                        .lastEvaluatedAt(c.getLastEvaluatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Retrieves historical audit scan reports.
     */
    @Transactional(readOnly = true)
    public List<ComplianceAuditScanResponse> getAllAuditReports() {
        return auditReportRepository.findAll().stream()
                .map(r -> ComplianceAuditScanResponse.builder()
                        .id(r.getId())
                        .scanTitle(r.getScanTitle())
                        .complianceScore(r.getComplianceScore())
                        .totalControlsEvaluated(r.getTotalControlsEvaluated())
                        .passedControlsCount(r.getPassedControlsCount())
                        .failedControlsCount(r.getFailedControlsCount())
                        .overallStatus(r.getOverallStatus())
                        .summaryDetails(r.getSummaryDetails())
                        .scannedAt(r.getScannedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private SecurityGovernancePolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(SecurityGovernancePolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .hipaaComplianceEnabled(true)
                        .soc2ComplianceEnabled(true)
                        .gdprComplianceEnabled(true)
                        .passwordRotationDays(90)
                        .sessionTimeoutMinutes(15)
                        .auditLogRetentionDays(365)
                        .strictMfaRequired(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private GovernancePolicyResponse mapToPolicyResponse(SecurityGovernancePolicy policy) {
        return GovernancePolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .hipaaComplianceEnabled(policy.isHipaaComplianceEnabled())
                .soc2ComplianceEnabled(policy.isSoc2ComplianceEnabled())
                .gdprComplianceEnabled(policy.isGdprComplianceEnabled())
                .passwordRotationDays(policy.getPasswordRotationDays())
                .sessionTimeoutMinutes(policy.getSessionTimeoutMinutes())
                .auditLogRetentionDays(policy.getAuditLogRetentionDays())
                .strictMfaRequired(policy.isStrictMfaRequired())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
