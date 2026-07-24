package com.medtrack.auth.mfa.controller;

import com.medtrack.auth.mfa.dto.RevokeDeviceRequest;
import com.medtrack.auth.mfa.dto.UserSessionDeviceResponse;
import com.medtrack.auth.mfa.service.DeviceSessionService;
import com.medtrack.auth.security.OwnershipAccessGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * =================================================================================================
 * ACTIVE DEVICE SESSIONS REST CONTROLLER (DeviceSessionController)
 * =================================================================================================
 * Exposes management APIs for monitoring active user sessions, registering device fingerprints,
 * and remotely revoking device access.
 */
@RestController
@RequestMapping("/api/auth/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "User Device Sessions", description = "Endpoints for device session tracking, active session management, and remote device termination.")
public class DeviceSessionController {

    private final DeviceSessionService deviceSessionService;
    private final OwnershipAccessGuard ownershipAccessGuard;

    @GetMapping("/active/{userId}")
    @Operation(summary = "Get active device sessions for user", description = "Fetches a list of active devices, IP addresses, location, and user-agent metadata. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<List<UserSessionDeviceResponse>> getActiveDevices(@PathVariable Long userId,
                                                                             Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        List<UserSessionDeviceResponse> devices = deviceSessionService.getActiveDevices(userId);
        return ResponseEntity.ok(devices);
    }

    @PostMapping("/register/{userId}")
    @Operation(summary = "Register device session", description = "Registers or updates an active device fingerprint upon login or request. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<UserSessionDeviceResponse> registerDevice(
            @PathVariable Long userId,
            HttpServletRequest request,
            Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        UserSessionDeviceResponse response = deviceSessionService.registerDeviceSession(userId, userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/revoke")
    @Operation(summary = "Revoke device session", description = "Terminates access for a specific device session. Callable only by the owning user or a HOSPITAL administrator.")
    public ResponseEntity<Map<String, Object>> revokeDevice(@Valid @RequestBody RevokeDeviceRequest request,
                                                             Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, request.getUserId());
        boolean revoked = deviceSessionService.revokeDeviceSession(request);
        return ResponseEntity.ok(Map.of(
                "success", revoked,
                "message", revoked ? "Device session revoked successfully" : "Target device session not found"
        ));
    }

    @PostMapping("/revoke-others/{userId}")
    @Operation(summary = "Revoke all other active device sessions", description = "Terminates all active device sessions for a user except the specified current session. Callable only by the target user or a HOSPITAL administrator.")
    public ResponseEntity<Map<String, Object>> revokeAllOtherDevices(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        ownershipAccessGuard.assertSelfOrHospitalAdmin(authentication, userId);
        String currentDeviceId = body.getOrDefault("currentDeviceId", "");
        int count = deviceSessionService.revokeAllOtherDevices(userId, currentDeviceId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Revoked all other active device sessions",
                "sessionsTerminated", count
        ));
    }
}
