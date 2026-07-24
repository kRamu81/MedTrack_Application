package com.medtrack.auth.mfa.controller;

import com.medtrack.auth.mfa.dto.*;
import com.medtrack.auth.mfa.service.MfaService;
import com.medtrack.auth.security.OwnershipAccessGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * =================================================================================================
 * MULTI-FACTOR AUTHENTICATION REST CONTROLLER (MfaController)
 * =================================================================================================
 * Exposes management APIs for setting up 2FA TOTP secrets, verifying 6-digit codes & recovery backup
 * codes, querying MFA configuration status, and disabling MFA.
 */
@RestController
@RequestMapping("/api/auth/mfa")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Multi-Factor Authentication", description = "Endpoints for 2FA TOTP setup, verification, recovery, and status tracking.")
public class MfaController {

    private final MfaService mfaService;
    private final OwnershipAccessGuard ownershipAccessGuard;

    @PostMapping("/setup/{userId}")
    @Operation(summary = "Initiate MFA setup", description = "Generates a 16-character Base32 TOTP secret, otpauth URI, and emergency recovery codes. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<MfaSetupResponse> setupMfa(@PathVariable Long userId, Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        MfaSetupResponse response = mfaService.setupMfa(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify TOTP code or emergency recovery code", description = "Validates the 6-digit TOTP code or recovery code to activate or complete 2FA login. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<Map<String, Object>> verifyMfa(@Valid @RequestBody MfaVerifyRequest request,
                                                          Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, request.getUserId());
        boolean verified = mfaService.verifyAndEnableMfa(request);
        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "MFA verification successful"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid 6-digit TOTP verification code or recovery key"
            ));
        }
    }

    @GetMapping("/status/{userId}")
    @Operation(summary = "Get MFA configuration status", description = "Retrieves MFA enabled state, last verified timestamp, and active device count. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<MfaStatusResponse> getMfaStatus(@PathVariable Long userId, Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        MfaStatusResponse response = mfaService.getMfaStatus(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/disable/{userId}")
    @Operation(summary = "Disable MFA", description = "Disables Multi-Factor Authentication for the specified user account. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<Map<String, Object>> disableMfa(@PathVariable Long userId, Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        boolean disabled = mfaService.disableMfa(userId);
        return ResponseEntity.ok(Map.of(
                "success", disabled,
                "message", disabled ? "MFA disabled successfully" : "MFA was not configured"
        ));
    }
}
