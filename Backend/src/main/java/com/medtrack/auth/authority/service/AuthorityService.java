package com.medtrack.auth.authority.service;

import com.medtrack.auth.authority.dto.*;
import com.medtrack.auth.authority.model.AuthorityAuditLog;
import com.medtrack.auth.authority.repository.AuthorityAuditRepository;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing user security authority versions, fine-grained RBAC/PBAC permissions,
 * and security audit logging.
 *
 * <p>Key Features:
 * <ul>
 *   <li><strong>Authority Versioning:</strong> Maintains an atomic incremental version on each user record.
 *       When an administrator demotes a role, revokes access, or changes credentials, incrementing the authority version
 *       causes all previously issued JWT tokens to fail validation immediately.</li>
 *   <li><strong>Granular Permission Authority:</strong> Maps fine-grained system capabilities (e.g. READ_ANALYTICS, WRITE_INVOICE)
 *       dynamically to user roles and individual account overrides.</li>
 *   <li><strong>Security Audit Trails:</strong> Logs every authority event, version bump, and privilege update to an immutable audit repository.</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthorityService {

    private final UserRepository userRepository;
    private final AuthorityAuditRepository auditRepository;

    /**
     * Default permission mapping per role.
     */
    private static final Map<String, Set<String>> ROLE_PERMISSIONS = Map.of(
            "HOSPITAL", Set.of("READ_EQUIPMENT", "WRITE_EQUIPMENT", "READ_ORDERS", "CREATE_ORDERS", "READ_MAINTENANCE", "MANAGE_USERS"),
            "TECHNICIAN", Set.of("READ_EQUIPMENT", "READ_MAINTENANCE", "UPDATE_MAINTENANCE", "SUBMIT_DIAGNOSTICS"),
            "SUPPLIER", Set.of("READ_ORDERS", "UPDATE_ORDER_STATUS", "READ_SHIPMENTS", "WRITE_SHIPMENTS", "SEND_INVOICE")
    );

    /**
     * Retrieves the current security authority details and version for a specified user.
     *
     * @param userId primary key of the target user entity
     * @return {@link AuthorityVersionResponse} containing role, permissions, and authority version
     */
    @Transactional(readOnly = true)
    public AuthorityVersionResponse getAuthorityVersion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Long currentVer = user.getAuthorityVersion() != null ? user.getAuthorityVersion() : 1L;
        Set<String> permissions = getPermissionsForRole(user.getRole());

        return AuthorityVersionResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .authorityVersion(currentVer)
                .permissions(permissions)
                .active(user.getAccountStatus() == com.medtrack.auth.model.AccountStatus.ACTIVE)
                .message("Authority details retrieved successfully")
                .build();
    }

    /**
     * Increments the authority version for a target user. This instantly invalidates any active
     * JWT access tokens bearing an older authority version claim.
     *
     * @param request {@link AuthorityUpdateRequest} specifying target user, reason, and actor
     * @return updated {@link AuthorityVersionResponse}
     */
    @Transactional
    public AuthorityVersionResponse incrementAuthorityVersion(AuthorityUpdateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        Long prevVersion = user.getAuthorityVersion() != null ? user.getAuthorityVersion() : 1L;
        Long newVersion = prevVersion + 1;
        user.setAuthorityVersion(newVersion);
        User savedUser = userRepository.save(user);

        String actor = request.getUpdatedBy() != null ? request.getUpdatedBy() : "SYSTEM";

        // Persist Audit Trail
        AuthorityAuditLog auditLog = AuthorityAuditLog.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .eventType("VERSION_INCREMENT")
                .description("Authority version incremented. Reason: " + request.getReason())
                .previousAuthorityVersion(prevVersion)
                .newAuthorityVersion(newVersion)
                .updatedBy(actor)
                .build();
        auditRepository.save(auditLog);

        return AuthorityVersionResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .authorityVersion(newVersion)
                .permissions(getPermissionsForRole(savedUser.getRole()))
                .active(savedUser.getAccountStatus() == com.medtrack.auth.model.AccountStatus.ACTIVE)
                .message("Authority version incremented to " + newVersion + ". Prior sessions invalidated.")
                .build();
    }

    /**
     * Bumps system-wide authority version for all active users (e.g. during security incident or key rotation).
     *
     * @param updatedBy administrator or process triggering global bump
     * @param reason security justification for global bump
     * @return total count of user accounts updated
     */
    @Transactional
    public int bumpGlobalAuthorityVersion(String updatedBy, String reason) {
        List<User> users = userRepository.findAll();
        String actor = updatedBy != null ? updatedBy : "SYSTEM_ADMIN";

        for (User user : users) {
            Long prevVer = user.getAuthorityVersion() != null ? user.getAuthorityVersion() : 1L;
            Long newVer = prevVer + 1;
            user.setAuthorityVersion(newVer);
            userRepository.save(user);

            AuthorityAuditLog audit = AuthorityAuditLog.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .eventType("GLOBAL_BUMP")
                    .description("Global security authority bump applied. Reason: " + reason)
                    .previousAuthorityVersion(prevVer)
                    .newAuthorityVersion(newVer)
                    .updatedBy(actor)
                    .build();
            auditRepository.save(audit);
        }
        return users.size();
    }

    /**
     * Validates whether a token's authority version matches the current user's database authority version.
     *
     * @param userId user identifier
     * @param tokenAuthorityVersion authority version parsed from JWT claim
     * @return {@code true} if token version matches active user version, {@code false} otherwise
     */
    @Transactional(readOnly = true)
    public boolean validateAuthorityVersion(Long userId, Long tokenAuthorityVersion) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }
        User user = userOpt.get();
        Long currentVer = user.getAuthorityVersion() != null ? user.getAuthorityVersion() : 1L;
        return currentVer.equals(tokenAuthorityVersion);
    }

    /**
     * Retrieves authority audit logs for a given user.
     *
     * @param userId target user ID
     * @return list of formatted {@link AuditLogResponse} entities
     */
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsForUser(Long userId) {
        return auditRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .map(this::mapToAuditResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper to retrieve permission authority set for a role string.
     *
     * @param role user security role
     * @return set of granted system permission strings
     */
    public Set<String> getPermissionsForRole(String role) {
        if (role == null) {
            return Set.of();
        }
        return ROLE_PERMISSIONS.getOrDefault(role.toUpperCase(), Set.of("READ_BASIC"));
    }

    /**
     * Helper mapping entity to DTO.
     */
    private AuditLogResponse mapToAuditResponse(AuthorityAuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .eventType(log.getEventType())
                .description(log.getDescription())
                .previousAuthorityVersion(log.getPreviousAuthorityVersion())
                .newAuthorityVersion(log.getNewAuthorityVersion())
                .updatedBy(log.getUpdatedBy())
                .timestamp(log.getTimestamp())
                .build();
    }
}
