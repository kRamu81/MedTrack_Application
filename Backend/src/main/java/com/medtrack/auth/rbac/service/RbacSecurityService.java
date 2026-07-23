package com.medtrack.auth.rbac.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.rbac.dto.*;
import com.medtrack.auth.rbac.model.*;
import com.medtrack.auth.rbac.repository.*;
import com.medtrack.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing RBAC Role-Permission Policy Matrix and Access Control evaluations.
 */
@Service
@RequiredArgsConstructor
public class RbacSecurityService {

    private final SecurityRoleRepository roleRepository;
    private final SecurityPermissionRepository permissionRepository;
    private final RolePermissionMappingRepository mappingRepository;
    private final UserRepository userRepository;

    /**
     * Seeds initial system roles and permissions if database is uninitialized.
     */
    @PostConstruct
    @Transactional
    public void seedInitialPermissionsAndRoles() {
        if (permissionRepository.count() == 0) {
            List<SecurityPermission> defaultPermissions = List.of(
                    SecurityPermission.builder().permissionCode("EQUIPMENT:READ").resourceCategory("EQUIPMENT").description("View hospital asset records").build(),
                    SecurityPermission.builder().permissionCode("EQUIPMENT:CREATE").resourceCategory("EQUIPMENT").description("Create new equipment assets").build(),
                    SecurityPermission.builder().permissionCode("EQUIPMENT:DELETE").resourceCategory("EQUIPMENT").description("Delete or retire asset records").build(),
                    SecurityPermission.builder().permissionCode("MAINTENANCE:SCHEDULE").resourceCategory("MAINTENANCE").description("Schedule preventive maintenance").build(),
                    SecurityPermission.builder().permissionCode("MAINTENANCE:APPROVE").resourceCategory("MAINTENANCE").description("Approve completed service tasks").build(),
                    SecurityPermission.builder().permissionCode("AUTHORITY:REVOKE").resourceCategory("SECURITY").description("Revoke user security authority versions").build(),
                    SecurityPermission.builder().permissionCode("MFA:CONFIGURE").resourceCategory("SECURITY").description("Manage account 2FA settings").build(),
                    SecurityPermission.builder().permissionCode("SSO:CONFIGURE").resourceCategory("SSO").description("Manage enterprise SSO identity providers").build()
            );
            permissionRepository.saveAll(defaultPermissions);
        }

        if (roleRepository.count() == 0) {
            SecurityRole adminRole = SecurityRole.builder()
                    .roleName("ROLE_ADMIN")
                    .description("Full enterprise platform system administrator")
                    .systemRole(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            SecurityRole doctorRole = SecurityRole.builder()
                    .roleName("ROLE_DOCTOR")
                    .description("Hospital medical doctor and head physician")
                    .systemRole(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            roleRepository.saveAll(List.of(adminRole, doctorRole));

            // Grant all permissions to ADMIN
            List<SecurityPermission> allPerms = permissionRepository.findAll();
            for (SecurityPermission perm : allPerms) {
                mappingRepository.save(RolePermissionMapping.builder()
                        .role(adminRole)
                        .permission(perm)
                        .assignedAt(LocalDateTime.now())
                        .build());
            }
        }
    }

    /**
     * Creates a new RBAC role.
     */
    @Transactional
    public RoleResponse createRole(RoleCreateRequest request) {
        String roleName = request.getRoleName().toUpperCase().trim();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        SecurityRole role = SecurityRole.builder()
                .roleName(roleName)
                .description(request.getDescription())
                .systemRole(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        SecurityRole saved = roleRepository.save(role);
        return mapToRoleResponse(saved, Collections.emptyList());
    }

    /**
     * Updates assigned permissions for a specified role.
     */
    @Transactional
    public RoleResponse updateRolePermissions(UpdateRolePermissionsRequest request) {
        SecurityRole role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + request.getRoleId()));

        // Delete existing mappings
        List<RolePermissionMapping> existing = mappingRepository.findByRoleId(role.getId());
        mappingRepository.deleteAll(existing);

        List<String> grantedCodes = new ArrayList<>();
        if (request.getPermissionCodes() != null) {
            for (String code : request.getPermissionCodes()) {
                Optional<SecurityPermission> permOpt = permissionRepository.findByPermissionCode(code);
                if (permOpt.isPresent()) {
                    mappingRepository.save(RolePermissionMapping.builder()
                            .role(role)
                            .permission(permOpt.get())
                            .assignedAt(LocalDateTime.now())
                            .build());
                    grantedCodes.add(code);
                }
            }
        }

        role.setUpdatedAt(LocalDateTime.now());
        roleRepository.save(role);

        return mapToRoleResponse(role, grantedCodes);
    }

    /**
     * Evaluates whether a user account holds a specified permission.
     */
    @Transactional(readOnly = true)
    public UserPermissionCheckResponse checkUserPermission(Long userId, String permissionCode) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return UserPermissionCheckResponse.builder()
                    .userId(userId)
                    .granted(false)
                    .message("User account not found")
                    .build();
        }

        User user = userOpt.get();
        String roleName = user.getRole() != null ? user.getRole().toUpperCase() : "ROLE_USER";
        if (!roleName.startsWith("ROLE_")) roleName = "ROLE_" + roleName;

        Optional<SecurityRole> roleOpt = roleRepository.findByRoleName(roleName);
        if (roleOpt.isEmpty()) {
            return UserPermissionCheckResponse.builder()
                    .userId(userId)
                    .roleName(roleName)
                    .permissionCode(permissionCode)
                    .granted(false)
                    .message("Role not registered in RBAC matrix")
                    .build();
        }

        List<RolePermissionMapping> mappings = mappingRepository.findByRoleId(roleOpt.get().getId());
        List<String> grantedCodes = mappings.stream()
                .map(m -> m.getPermission().getPermissionCode())
                .collect(Collectors.toList());

        boolean granted = grantedCodes.contains(permissionCode) || roleName.equals("ROLE_ADMIN");

        return UserPermissionCheckResponse.builder()
                .userId(userId)
                .roleName(roleName)
                .permissionCode(permissionCode)
                .granted(granted)
                .allGrantedPermissions(grantedCodes)
                .message(granted ? "Permission granted" : "Access denied by RBAC policy")
                .build();
    }

    /**
     * Retrieves all registered RBAC roles.
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream().map(role -> {
            List<RolePermissionMapping> mappings = mappingRepository.findByRoleId(role.getId());
            List<String> codes = mappings.stream()
                    .map(m -> m.getPermission().getPermissionCode())
                    .collect(Collectors.toList());
            return mapToRoleResponse(role, codes);
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves all granular permissions.
     */
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> PermissionResponse.builder()
                        .id(p.getId())
                        .permissionCode(p.getPermissionCode())
                        .resourceCategory(p.getResourceCategory())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    private RoleResponse mapToRoleResponse(SecurityRole role, List<String> grantedPermissions) {
        return RoleResponse.builder()
                .id(role.getId())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .systemRole(role.isSystemRole())
                .grantedPermissionCodes(grantedPermissions)
                .build();
    }
}
