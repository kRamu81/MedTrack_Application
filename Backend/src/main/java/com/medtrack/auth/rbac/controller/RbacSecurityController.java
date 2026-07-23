package com.medtrack.auth.rbac.controller;

import com.medtrack.auth.rbac.dto.*;
import com.medtrack.auth.rbac.service.RbacSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * =================================================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC) REST CONTROLLER (RbacSecurityController)
 * =================================================================================================
 * Exposes management APIs for roles, granular permissions, policy assignment matrix, and real-time
 * access right evaluations.
 */
@RestController
@RequestMapping("/api/auth/rbac")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Role-Based Access Control (RBAC)", description = "Endpoints for managing system roles, granular permissions, and authorization matrix.")
public class RbacSecurityController {

    private final RbacSecurityService rbacSecurityService;

    @GetMapping("/roles")
    @Operation(summary = "Get all RBAC Roles", description = "Retrieves all registered roles and their granted permission codes.")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = rbacSecurityService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/permissions")
    @Operation(summary = "Get all Permissions", description = "Retrieves all granular system permission codes grouped by resource category.")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        List<PermissionResponse> permissions = rbacSecurityService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    @PostMapping("/roles")
    @Operation(summary = "Create custom RBAC Role", description = "Onboards a new custom application role.")
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleCreateRequest request) {
        RoleResponse response = rbacSecurityService.createRole(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/matrix")
    @Operation(summary = "Update Role Permission Matrix", description = "Assigns or revokes granular permission codes for a role.")
    public ResponseEntity<RoleResponse> updateRolePermissions(@Valid @RequestBody UpdateRolePermissionsRequest request) {
        RoleResponse response = rbacSecurityService.updateRolePermissions(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{userId}")
    @Operation(summary = "Evaluate User Permission", description = "Evaluates whether a user has access rights for a specific permission code.")
    public ResponseEntity<UserPermissionCheckResponse> checkUserPermission(
            @PathVariable Long userId,
            @RequestParam String permissionCode) {
        UserPermissionCheckResponse response = rbacSecurityService.checkUserPermission(userId, permissionCode);
        return ResponseEntity.ok(response);
    }
}
