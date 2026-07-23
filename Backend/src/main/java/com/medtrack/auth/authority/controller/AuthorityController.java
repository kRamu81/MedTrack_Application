package com.medtrack.auth.authority.controller;

import com.medtrack.auth.authority.dto.*;
import com.medtrack.auth.authority.service.AuthorityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * =================================================================================================
 * ENTERPRISE SECURITY AUTHORITY REST CONTROLLER (AuthorityController)
 * =================================================================================================
 * Exposes management APIs for monitoring user security authority versions, triggering immediate
 * token revocation via version increments, broadcasting global security authority bumps, and
 * querying persistent security audit logs.
 */
@RestController
@RequestMapping("/api/auth/authority")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Authority", description = "Endpoints for managing user authority versions, token invalidation, role permissions, and audit logs.")
public class AuthorityController {

    private final AuthorityService authorityService;

    /**
     * Retrieves authority state, role permissions, and active authority version for a target user.
     *
     * @param userId primary key identifier of the target user account
     * @return {@link AuthorityVersionResponse} containing current version and permissions
     */
    @GetMapping("/version/{userId}")
    @Operation(summary = "Get user authority version & permissions", description = "Fetches the current authority version, role permissions, and active status for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Authority details retrieved successfully", content = @Content(schema = @Schema(implementation = AuthorityVersionResponse.class))),
        @ApiResponse(responseCode = "404", description = "User account not found")
    })
    public ResponseEntity<AuthorityVersionResponse> getAuthorityVersion(@PathVariable Long userId) {
        AuthorityVersionResponse response = authorityService.getAuthorityVersion(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Increments a user's security authority version.
     * Bumping the version immediately invalidates all active JWT tokens issued under previous versions.
     *
     * @param request {@link AuthorityUpdateRequest} specifying target user and update reason
     * @return updated {@link AuthorityVersionResponse} payload
     */
    @PostMapping("/version/increment")
    @Operation(summary = "Increment user authority version (Revoke active sessions)", description = "Increments user authority version, immediately invalidating any active JWT access tokens for that user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Authority version incremented successfully", content = @Content(schema = @Schema(implementation = AuthorityVersionResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request payload or missing justification"),
        @ApiResponse(responseCode = "404", description = "Target user account not found")
    })
    public ResponseEntity<AuthorityVersionResponse> incrementAuthorityVersion(@Valid @RequestBody AuthorityUpdateRequest request) {
        AuthorityVersionResponse response = authorityService.incrementAuthorityVersion(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Broadcasts a global authority version increment across all system accounts.
     * Useful during key rotation events, system maintenance, or privilege schema changes.
     *
     * @param request body map containing "reason" and "updatedBy"
     * @return HTTP response wrapping count of updated accounts
     */
    @PostMapping("/version/bump-global")
    @Operation(summary = "Bump system-wide global authority version", description = "Increments authority version for all registered user accounts to enforce global re-authentication.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Global authority bump completed successfully")
    })
    public ResponseEntity<Map<String, Object>> bumpGlobalAuthorityVersion(@RequestBody Map<String, String> request) {
        String reason = request.getOrDefault("reason", "Global security re-validation");
        String updatedBy = request.getOrDefault("updatedBy", "ADMIN");
        int count = authorityService.bumpGlobalAuthorityVersion(updatedBy, reason);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Global authority version bumped for all accounts",
                "accountsUpdated", count
        ));
    }

    /**
     * Retrieves security authority audit records for a specified user account.
     *
     * @param userId user identifier
     * @return list of {@link AuditLogResponse} audit events
     */
    @GetMapping("/audit-logs/{userId}")
    @Operation(summary = "Fetch authority audit logs for a user", description = "Queries immutable audit history for authority version changes and role modifications.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully")
    })
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsForUser(@PathVariable Long userId) {
        List<AuditLogResponse> logs = authorityService.getAuditLogsForUser(userId);
        return ResponseEntity.ok(logs);
    }
}
