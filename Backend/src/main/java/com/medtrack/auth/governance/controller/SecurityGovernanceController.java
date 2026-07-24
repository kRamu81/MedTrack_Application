package com.medtrack.auth.governance.controller;

import com.medtrack.auth.governance.dto.*;
import com.medtrack.auth.governance.service.SecurityGovernanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Security Governance & Compliance Management (HIPAA, SOC2, GDPR, ISO27001).
 */
@RestController
@RequestMapping("/api/auth/governance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Governance & Compliance Engine", description = "APIs for regulatory compliance policies, control scanning, and security audits.")
public class SecurityGovernanceController {

    private final SecurityGovernanceService governanceService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Policy", description = "Retrieves active security governance policy settings.")
    public ResponseEntity<GovernancePolicyResponse> getActivePolicy() {
        GovernancePolicyResponse policy = governanceService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Governance Policy", description = "Updates compliance framework settings and retention rules.")
    public ResponseEntity<GovernancePolicyResponse> updatePolicy(@Valid @RequestBody GovernancePolicyUpdateRequest request) {
        GovernancePolicyResponse updated = governanceService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/scan")
    @Operation(summary = "Run Compliance Scan", description = "Triggers an automated security posture audit scan across all compliance controls.")
    public ResponseEntity<ComplianceAuditScanResponse> runComplianceScan() {
        ComplianceAuditScanResponse scan = governanceService.runComplianceScan();
        return ResponseEntity.ok(scan);
    }

    @GetMapping("/controls")
    @Operation(summary = "Get All Compliance Controls", description = "Retrieves all HIPAA, SOC2, GDPR, and ISO27001 control rules.")
    public ResponseEntity<List<ComplianceControlResponse>> getAllControls() {
        List<ComplianceControlResponse> controls = governanceService.getAllControls();
        return ResponseEntity.ok(controls);
    }

    @GetMapping("/reports")
    @Operation(summary = "Get Compliance Audit Reports", description = "Retrieves historical audit scan reports.")
    public ResponseEntity<List<ComplianceAuditScanResponse>> getAllAuditReports() {
        List<ComplianceAuditScanResponse> reports = governanceService.getAllAuditReports();
        return ResponseEntity.ok(reports);
    }
}
