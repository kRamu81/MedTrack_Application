package com.medtrack.auth.playbook.service;

import com.medtrack.auth.playbook.dto.*;
import com.medtrack.auth.playbook.model.*;
import com.medtrack.auth.playbook.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Automated SOAR Security Containment Playbooks.
 */
@Service
@RequiredArgsConstructor
public class SecurityPlaybookService {

    private final SecurityPlaybookPolicyRepository policyRepository;
    private final SecurityPlaybookExecutionRepository executionRepository;
    private final PlaybookStepResultRepository stepResultRepository;

    private static final String DEFAULT_PLAYBOOK_NAME = "MASTER_CONTAINMENT_PLAYBOOK";

    /**
     * Seeds baseline automated security containment playbooks.
     */
    @PostConstruct
    @Transactional
    public void seedPlaybookBaseline() {
        if (policyRepository.findByPlaybookName(DEFAULT_PLAYBOOK_NAME).isEmpty()) {
            SecurityPlaybookPolicy policy = SecurityPlaybookPolicy.builder()
                    .playbookName(DEFAULT_PLAYBOOK_NAME)
                    .triggerEvent("BRUTE_FORCE")
                    .defaultContainmentAction("REVOKE_TOKENS_AND_BAN_IP")
                    .executionMode("AUTOMATIC")
                    .cooldownMinutes(15)
                    .notifySocOnExecution(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        seedDefaultExecution("PLBK-EXEC-101", DEFAULT_PLAYBOOK_NAME, "BRUTE_FORCE", "REVOKE_TOKENS_AND_BAN_IP", "SUCCESS", "ip:192.168.1.105", "PLAYBOOK_ENGINE", "Automated lockout executed for malicious IP brute-force burst");
    }

    private void seedDefaultExecution(String execId, String pbName, String trigger, String action, String status, String asset, String by, String summary) {
        if (executionRepository.findByExecutionId(execId).isEmpty()) {
            executionRepository.save(SecurityPlaybookExecution.builder()
                    .executionId(execId)
                    .playbookName(pbName)
                    .triggerEvent(trigger)
                    .executedAction(action)
                    .executionStatus(status)
                    .affectedAsset(asset)
                    .executedBy(by)
                    .executionSummary(summary)
                    .executedAt(LocalDateTime.now().minusHours(2))
                    .build());

            stepResultRepository.save(PlaybookStepResult.builder()
                    .stepId("STEP-01")
                    .stepName("REVOKE_JWT_TOKENS")
                    .stepStatus("COMPLETED")
                    .stepDetails("Revoked 4 active user tokens for " + asset)
                    .executionId(execId)
                    .executedAt(LocalDateTime.now().minusHours(2))
                    .build());

            stepResultRepository.save(PlaybookStepResult.builder()
                    .stepId("STEP-02")
                    .stepName("IP_FIREWALL_BLOCK")
                    .stepStatus("COMPLETED")
                    .stepDetails("Pushed null route rule to ZTNA firewall for " + asset)
                    .executionId(execId)
                    .executedAt(LocalDateTime.now().minusHours(2))
                    .build());
        }
    }

    /**
     * Retrieves active security playbook policy settings.
     */
    @Transactional(readOnly = true)
    public PlaybookPolicyResponse getActivePolicy() {
        SecurityPlaybookPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates security playbook policy settings.
     */
    @Transactional
    public PlaybookPolicyResponse updatePolicy(PlaybookPolicyUpdateRequest request) {
        SecurityPlaybookPolicy policy = getOrCreatePolicy();
        policy.setTriggerEvent(request.getTriggerEvent().toUpperCase());
        policy.setDefaultContainmentAction(request.getDefaultContainmentAction().toUpperCase());
        policy.setExecutionMode(request.getExecutionMode().toUpperCase());
        policy.setCooldownMinutes(request.getCooldownMinutes());
        policy.setNotifySocOnExecution(request.isNotifySocOnExecution());
        policy.setUpdatedAt(LocalDateTime.now());

        SecurityPlaybookPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Triggers and executes an automated security containment playbook.
     */
    @Transactional
    public SecurityPlaybookExecutionResponse triggerPlaybookExecution(TriggerPlaybookExecutionRequest request, String operator) {
        String executionId = "PLBK-EXEC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        SecurityPlaybookPolicy policy = getOrCreatePolicy();

        String action = policy.getDefaultContainmentAction();
        String status = "SUCCESS";
        String summary = request.getCustomNotes() != null ? request.getCustomNotes() : "Automated SOAR playbook triggered for event " + request.getTriggerEvent() + " on target asset: " + request.getAffectedAsset();

        SecurityPlaybookExecution execution = SecurityPlaybookExecution.builder()
                .executionId(executionId)
                .playbookName(request.getPlaybookName())
                .triggerEvent(request.getTriggerEvent().toUpperCase())
                .executedAction(action)
                .executionStatus(status)
                .affectedAsset(request.getAffectedAsset())
                .executedBy(operator != null ? operator : "PLAYBOOK_ENGINE")
                .executionSummary(summary)
                .executedAt(LocalDateTime.now())
                .build();

        SecurityPlaybookExecution saved = executionRepository.save(execution);

        // Auto-generate playbook steps
        stepResultRepository.save(PlaybookStepResult.builder()
                .stepId("STEP-01")
                .stepName("ISOLATE_AFFECTED_ASSET")
                .stepStatus("COMPLETED")
                .stepDetails("Isolated target asset: " + request.getAffectedAsset())
                .executionId(executionId)
                .executedAt(LocalDateTime.now())
                .build());

        stepResultRepository.save(PlaybookStepResult.builder()
                .stepId("STEP-02")
                .stepName("REVOKE_ACTIVE_SESSIONS")
                .stepStatus("COMPLETED")
                .stepDetails("Invalidated session tokens and credentials for asset: " + request.getAffectedAsset())
                .executionId(executionId)
                .executedAt(LocalDateTime.now())
                .build());

        return mapToExecutionResponse(saved);
    }

    /**
     * Records a specific step result for a playbook execution.
     */
    @Transactional
    public PlaybookStepResultResponse recordPlaybookStep(RecordPlaybookStepRequest request) {
        PlaybookStepResult result = PlaybookStepResult.builder()
                .executionId(request.getExecutionId())
                .stepId(request.getStepId().toUpperCase())
                .stepName(request.getStepName().toUpperCase())
                .stepStatus(request.getStepStatus().toUpperCase())
                .stepDetails(request.getStepDetails() != null ? request.getStepDetails() : "Playbook step executed successfully")
                .executedAt(LocalDateTime.now())
                .build();

        PlaybookStepResult saved = stepResultRepository.save(result);
        return mapToStepResponse(saved);
    }

    /**
     * Retrieves all historical playbook executions.
     */
    @Transactional(readOnly = true)
    public List<SecurityPlaybookExecutionResponse> getAllExecutions() {
        return executionRepository.findAll().stream()
                .map(this::mapToExecutionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all step results for a specific execution ID.
     */
    @Transactional(readOnly = true)
    public List<PlaybookStepResultResponse> getStepsByExecutionId(String executionId) {
        return stepResultRepository.findByExecutionId(executionId).stream()
                .map(this::mapToStepResponse)
                .collect(Collectors.toList());
    }

    private SecurityPlaybookPolicy getOrCreatePolicy() {
        return policyRepository.findByPlaybookName(DEFAULT_PLAYBOOK_NAME)
                .orElseGet(() -> policyRepository.save(SecurityPlaybookPolicy.builder()
                        .playbookName(DEFAULT_PLAYBOOK_NAME)
                        .triggerEvent("BRUTE_FORCE")
                        .defaultContainmentAction("REVOKE_TOKENS_AND_BAN_IP")
                        .executionMode("AUTOMATIC")
                        .cooldownMinutes(15)
                        .notifySocOnExecution(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private PlaybookPolicyResponse mapToPolicyResponse(SecurityPlaybookPolicy policy) {
        return PlaybookPolicyResponse.builder()
                .id(policy.getId())
                .playbookName(policy.getPlaybookName())
                .triggerEvent(policy.getTriggerEvent())
                .defaultContainmentAction(policy.getDefaultContainmentAction())
                .executionMode(policy.getExecutionMode())
                .cooldownMinutes(policy.getCooldownMinutes())
                .notifySocOnExecution(policy.isNotifySocOnExecution())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private SecurityPlaybookExecutionResponse mapToExecutionResponse(SecurityPlaybookExecution execution) {
        return SecurityPlaybookExecutionResponse.builder()
                .id(execution.getId())
                .executionId(execution.getExecutionId())
                .playbookName(execution.getPlaybookName())
                .triggerEvent(execution.getTriggerEvent())
                .executedAction(execution.getExecutedAction())
                .executionStatus(execution.getExecutionStatus())
                .affectedAsset(execution.getAffectedAsset())
                .executedBy(execution.getExecutedBy())
                .executionSummary(execution.getExecutionSummary())
                .executedAt(execution.getExecutedAt())
                .build();
    }

    private PlaybookStepResultResponse mapToStepResponse(PlaybookStepResult result) {
        return PlaybookStepResultResponse.builder()
                .id(result.getId())
                .stepId(result.getStepId())
                .stepName(result.getStepName())
                .stepStatus(result.getStepStatus())
                .stepDetails(result.getStepDetails())
                .executionId(result.getExecutionId())
                .executedAt(result.getExecutedAt())
                .build();
    }
}
