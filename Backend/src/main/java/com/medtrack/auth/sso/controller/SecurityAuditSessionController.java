package com.medtrack.auth.sso.controller;

import com.medtrack.auth.sso.dto.SecurityRiskAnalysisResponse;
import com.medtrack.auth.sso.model.SecurityAuditSessionLog;
import com.medtrack.auth.sso.service.SecurityAuditSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * =================================================================================================
 * SECURITY AUDIT & RISK ANALYSIS REST CONTROLLER (SecurityAuditSessionController)
 * =================================================================================================
 * Exposes endpoints for session threat risk analysis, anomaly detection, and audit log queries.
 */
@RestController
@RequestMapping("/api/auth/audit")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Audit & Risk Hub", description = "Endpoints for threat risk evaluation and session security audit logs.")
public class SecurityAuditSessionController {

    private final SecurityAuditSessionService auditSessionService;

    @GetMapping("/risk/{userId}")
    @Operation(summary = "Evaluate Security Threat Risk", description = "Calculates threat risk score (0-100), risk classification level, and anomaly flags.")
    public ResponseEntity<SecurityRiskAnalysisResponse> evaluateRisk(@PathVariable Long userId) {
        SecurityRiskAnalysisResponse response = auditSessionService.evaluateSecurityRisk(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get User Audit Session Logs", description = "Retrieves timestamped audit logs for a specific user.")
    public ResponseEntity<List<SecurityAuditSessionLog>> getUserAuditLogs(@PathVariable Long userId) {
        List<SecurityAuditSessionLog> logs = auditSessionService.getUserAuditLogs(userId);
        return ResponseEntity.ok(logs);
    }
}
