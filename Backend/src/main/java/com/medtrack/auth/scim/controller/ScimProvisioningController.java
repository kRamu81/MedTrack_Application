package com.medtrack.auth.scim.controller;

import com.medtrack.auth.scim.dto.*;
import com.medtrack.auth.scim.service.ScimProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for SCIM 2.0 Identity Federation & Enterprise User Provisioning.
 */
@RestController
@RequestMapping("/api/auth/scim")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "SCIM 2.0 User Provisioning & Federation", description = "APIs for Okta, Azure AD, and PingIdentity user sync, role mapping, and deprovisioning.")
public class ScimProvisioningController {

    private final ScimProvisioningService scimService;

    @GetMapping("/policy")
    @Operation(summary = "Get SCIM Policy", description = "Retrieves active SCIM provisioning policy settings.")
    public ResponseEntity<ScimPolicyResponse> getActivePolicy() {
        ScimPolicyResponse policy = scimService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update SCIM Policy", description = "Updates SCIM federation rules and deprovisioning actions.")
    public ResponseEntity<ScimPolicyResponse> updatePolicy(@Valid @RequestBody ScimPolicyUpdateRequest request) {
        ScimPolicyResponse updated = scimService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/users/provision")
    @Operation(summary = "Provision SCIM User", description = "Provisions or updates a federated user identity.")
    public ResponseEntity<ScimUserMappingResponse> provisionScimUser(@Valid @RequestBody ProvisionScimUserRequest request) {
        ScimUserMappingResponse response = scimService.provisionScimUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/deprovision")
    @Operation(summary = "Deprovision SCIM User", description = "Deprovisions or suspends a federated identity.")
    public ResponseEntity<ScimUserMappingResponse> deprovisionScimUser(@Valid @RequestBody DeprovisionScimUserRequest request) {
        ScimUserMappingResponse response = scimService.deprovisionScimUser(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "Get Mapped SCIM Users", description = "Retrieves all federated SCIM user mappings.")
    public ResponseEntity<List<ScimUserMappingResponse>> getAllUserMappings() {
        List<ScimUserMappingResponse> mappings = scimService.getAllUserMappings();
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get SCIM Audit Logs", description = "Retrieves SCIM lifecycle provisioning audit logs.")
    public ResponseEntity<List<ScimAuditLogResponse>> getAllAuditLogs() {
        List<ScimAuditLogResponse> logs = scimService.getAllAuditLogs();
        return ResponseEntity.ok(logs);
    }
}
