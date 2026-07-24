package com.medtrack.auth.zerotrust.controller;

import com.medtrack.auth.zerotrust.dto.*;
import com.medtrack.auth.zerotrust.service.ZeroTrustSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Zero-Trust Security Policy Management, IP Threat Reputation Tracking,
 * and Anomaly Violation Auditing.
 */
@RestController
@RequestMapping("/api/auth/zerotrust")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Zero-Trust Security Guard", description = "APIs for IP threat intelligence, rate limiting, and anomaly violation enforcement.")
public class ZeroTrustSecurityController {

    private final ZeroTrustSecurityService zeroTrustSecurityService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Policy", description = "Retrieves the current active zero-trust security policy settings.")
    public ResponseEntity<ZeroTrustPolicyResponse> getActivePolicy() {
        ZeroTrustPolicyResponse policy = zeroTrustSecurityService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Policy", description = "Updates zero-trust rate limiting and threat detection rules.")
    public ResponseEntity<ZeroTrustPolicyResponse> updatePolicy(@Valid @RequestBody ZeroTrustPolicyUpdateRequest request) {
        ZeroTrustPolicyResponse updated = zeroTrustSecurityService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/evaluate")
    @Operation(summary = "Evaluate IP Threat", description = "Evaluates an IP address threat score and block status.")
    public ResponseEntity<IpThreatEvaluationResponse> evaluateIpThreat(
            @RequestParam String ipAddress,
            @RequestParam(required = false) String countryCode) {
        IpThreatEvaluationResponse response = zeroTrustSecurityService.evaluateIpThreat(ipAddress, countryCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/record-failed")
    @Operation(summary = "Record Failed Attempt", description = "Increments failed authentication attempt counter for an IP address.")
    public ResponseEntity<IpThreatEvaluationResponse> recordFailedAttempt(@RequestParam String ipAddress) {
        IpThreatEvaluationResponse response = zeroTrustSecurityService.recordFailedAttempt(ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unblock")
    @Operation(summary = "Unblock IP Address", description = "Manually unblocks a restricted IP address.")
    public ResponseEntity<IpThreatEvaluationResponse> unblockIp(@RequestParam String ipAddress) {
        IpThreatEvaluationResponse response = zeroTrustSecurityService.unblockIp(ipAddress);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/threat-logs")
    @Operation(summary = "Get All IP Threat Logs", description = "Retrieves all IP reputation intelligence logs.")
    public ResponseEntity<List<IpThreatEvaluationResponse>> getAllIpThreatLogs() {
        List<IpThreatEvaluationResponse> logs = zeroTrustSecurityService.getAllIpThreatLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/violations")
    @Operation(summary = "Get Security Policy Violations", description = "Retrieves all recorded policy violation events.")
    public ResponseEntity<List<SecurityPolicyViolationResponse>> getAllViolations() {
        List<SecurityPolicyViolationResponse> violations = zeroTrustSecurityService.getAllViolations();
        return ResponseEntity.ok(violations);
    }
}
