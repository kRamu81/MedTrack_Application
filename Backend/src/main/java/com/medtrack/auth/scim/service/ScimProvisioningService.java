package com.medtrack.auth.scim.service;

import com.medtrack.auth.scim.dto.*;
import com.medtrack.auth.scim.model.*;
import com.medtrack.auth.scim.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing SCIM 2.0 User Provisioning & IdP Identity Federation lifecycle.
 */
@Service
@RequiredArgsConstructor
public class ScimProvisioningService {

    private final ScimProvisioningPolicyRepository policyRepository;
    private final ScimUserMappingRepository userMappingRepository;
    private final ScimProvisioningAuditLogRepository auditLogRepository;

    private static final String DEFAULT_POLICY_NAME = "MASTER_SCIM_POLICY";

    /**
     * Seeds initial SCIM provisioning configuration and sample enterprise IdP user mappings.
     */
    @PostConstruct
    @Transactional
    public void seedScimBaseline() {
        if (policyRepository.findByPolicyName(DEFAULT_POLICY_NAME).isEmpty()) {
            ScimProvisioningPolicy policy = ScimProvisioningPolicy.builder()
                    .policyName(DEFAULT_POLICY_NAME)
                    .primaryIdpProvider("OKTA")
                    .defaultDeprovisionAction("SUSPEND")
                    .autoSyncEnabled(true)
                    .enforceRoleMapping(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            policyRepository.save(policy);
        }

        seedDefaultUser("okta-001", "sarah.connor", "sarah@medtrack.org", "OKTA", "HOSPITAL_ADMIN");
        seedDefaultUser("azure-002", "john.doe", "john.doe@medtrack.org", "AZURE_AD", "TECHNICIAN");
    }

    private void seedDefaultUser(String extId, String username, String email, String idp, String role) {
        if (userMappingRepository.findByScimExternalId(extId).isEmpty()) {
            ScimUserMapping mapping = ScimUserMapping.builder()
                    .scimExternalId(extId)
                    .medtrackUsername(username)
                    .email(email)
                    .enterpriseIdpProvider(idp)
                    .assignedRole(role)
                    .syncStatus("PROVISIONED")
                    .lastSyncedAt(LocalDateTime.now().minusDays(2))
                    .build();
            userMappingRepository.save(mapping);
        }
    }

    /**
     * Retrieves active SCIM policy configuration.
     */
    @Transactional(readOnly = true)
    public ScimPolicyResponse getActivePolicy() {
        ScimProvisioningPolicy policy = getOrCreatePolicy();
        return mapToPolicyResponse(policy);
    }

    /**
     * Updates SCIM provisioning policy configuration.
     */
    @Transactional
    public ScimPolicyResponse updatePolicy(ScimPolicyUpdateRequest request) {
        ScimProvisioningPolicy policy = getOrCreatePolicy();
        policy.setPrimaryIdpProvider(request.getPrimaryIdpProvider().toUpperCase());
        policy.setDefaultDeprovisionAction(request.getDefaultDeprovisionAction().toUpperCase());
        policy.setAutoSyncEnabled(request.isAutoSyncEnabled());
        policy.setEnforceRoleMapping(request.isEnforceRoleMapping());
        policy.setUpdatedAt(LocalDateTime.now());

        ScimProvisioningPolicy updated = policyRepository.save(policy);
        return mapToPolicyResponse(updated);
    }

    /**
     * Provisions or updates a federated enterprise identity via SCIM 2.0.
     */
    @Transactional
    public ScimUserMappingResponse provisionScimUser(ProvisionScimUserRequest request) {
        ScimUserMapping mapping = userMappingRepository.findByScimExternalId(request.getScimExternalId())
                .orElseGet(() -> ScimUserMapping.builder()
                        .scimExternalId(request.getScimExternalId())
                        .build());

        boolean isNew = mapping.getId() == null;
        mapping.setMedtrackUsername(request.getMedtrackUsername());
        mapping.setEmail(request.getEmail());
        mapping.setEnterpriseIdpProvider(request.getEnterpriseIdpProvider().toUpperCase());
        mapping.setAssignedRole(request.getAssignedRole().toUpperCase());
        mapping.setSyncStatus("PROVISIONED");
        mapping.setLastSyncedAt(LocalDateTime.now());

        ScimUserMapping saved = userMappingRepository.save(mapping);

        recordAuditLog(
                request.getScimExternalId(),
                isNew ? "USER_CREATED" : "USER_UPDATED",
                "EXECUTED",
                "SCIM 2.0 identity synced for " + request.getMedtrackUsername() + " via " + request.getEnterpriseIdpProvider()
        );

        return mapToUserMappingResponse(saved);
    }

    /**
     * Deprovisions or suspends a federated identity via SCIM 2.0.
     */
    @Transactional
    public ScimUserMappingResponse deprovisionScimUser(DeprovisionScimUserRequest request) {
        ScimUserMapping mapping = userMappingRepository.findByScimExternalId(request.getScimExternalId())
                .orElseThrow(() -> new IllegalArgumentException("SCIM external user ID not found: " + request.getScimExternalId()));

        ScimProvisioningPolicy policy = getOrCreatePolicy();
        String action = policy.getDefaultDeprovisionAction();

        mapping.setSyncStatus(action.equalsIgnoreCase("SUSPEND") ? "SUSPENDED" : "DEPROVISIONED");
        mapping.setLastSyncedAt(LocalDateTime.now());

        ScimUserMapping updated = userMappingRepository.save(mapping);

        recordAuditLog(
                request.getScimExternalId(),
                "USER_DEPROVISIONED",
                "EXECUTED",
                "Deprovisioned identity (" + action + ") for " + mapping.getMedtrackUsername() + ". Reason: " + request.getDeprovisionReason()
        );

        return mapToUserMappingResponse(updated);
    }

    /**
     * Retrieves all mapped SCIM enterprise users.
     */
    @Transactional(readOnly = true)
    public List<ScimUserMappingResponse> getAllUserMappings() {
        return userMappingRepository.findAll().stream()
                .map(this::mapToUserMappingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves SCIM provisioning audit logs.
     */
    @Transactional(readOnly = true)
    public List<ScimAuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(this::mapToAuditLogResponse)
                .collect(Collectors.toList());
    }

    private void recordAuditLog(String extId, String action, String status, String details) {
        ScimProvisioningAuditLog log = ScimProvisioningAuditLog.builder()
                .scimExternalId(extId)
                .actionType(action)
                .executedBy("SCIM_CONNECTOR")
                .status(status)
                .auditDetails(details)
                .executedAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    private ScimProvisioningPolicy getOrCreatePolicy() {
        return policyRepository.findByPolicyName(DEFAULT_POLICY_NAME)
                .orElseGet(() -> policyRepository.save(ScimProvisioningPolicy.builder()
                        .policyName(DEFAULT_POLICY_NAME)
                        .primaryIdpProvider("OKTA")
                        .defaultDeprovisionAction("SUSPEND")
                        .autoSyncEnabled(true)
                        .enforceRoleMapping(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()));
    }

    private ScimPolicyResponse mapToPolicyResponse(ScimProvisioningPolicy policy) {
        return ScimPolicyResponse.builder()
                .id(policy.getId())
                .policyName(policy.getPolicyName())
                .primaryIdpProvider(policy.getPrimaryIdpProvider())
                .defaultDeprovisionAction(policy.getDefaultDeprovisionAction())
                .autoSyncEnabled(policy.isAutoSyncEnabled())
                .enforceRoleMapping(policy.isEnforceRoleMapping())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private ScimUserMappingResponse mapToUserMappingResponse(ScimUserMapping mapping) {
        return ScimUserMappingResponse.builder()
                .id(mapping.getId())
                .scimExternalId(mapping.getScimExternalId())
                .medtrackUsername(mapping.getMedtrackUsername())
                .email(mapping.getEmail())
                .enterpriseIdpProvider(mapping.getEnterpriseIdpProvider())
                .assignedRole(mapping.getAssignedRole())
                .syncStatus(mapping.getSyncStatus())
                .lastSyncedAt(mapping.getLastSyncedAt())
                .build();
    }

    private ScimAuditLogResponse mapToAuditLogResponse(ScimProvisioningAuditLog log) {
        return ScimAuditLogResponse.builder()
                .id(log.getId())
                .scimExternalId(log.getScimExternalId())
                .actionType(log.getActionType())
                .executedBy(log.getExecutedBy())
                .status(log.getStatus())
                .auditDetails(log.getAuditDetails())
                .executedAt(log.getExecutedAt())
                .build();
    }
}
