package com.medtrack.auth.compliance.controller;

import com.medtrack.auth.compliance.dto.*;
import com.medtrack.auth.compliance.service.ComplianceSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Regulatory Compliance Auditing (SOC2, HIPAA, GDPR, ISO 27001) and Control Evidence Ingestion.
 */
@RestController
@RequestMapping("/api/auth/compliance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Regulatory Compliance & Security Audit", description = "APIs for SOC2, HIPAA, GDPR regulatory policies, audit execution, and evidence reporting.")
public class ComplianceSecurityController {

    private final ComplianceSecurityService complianceService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Compliance Policy", description = "Retrieves active compliance framework settings.")
    public ResponseEntity<CompliancePolicyResponse> getActivePolicy() {
        CompliancePolicyResponse policy = complianceService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Compliance Policy", description = "Updates active regulatory standard and retention settings.")
    public ResponseEntity<CompliancePolicyResponse> updatePolicy(@Valid @RequestBody CompliancePolicyUpdateRequest request) {
        CompliancePolicyResponse updated = complianceService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/audit/run")
    @Operation(summary = "Run Compliance Audit", description = "Executes automated regulatory framework evaluation.")
    public ResponseEntity<ComplianceAuditReportResponse> runComplianceAudit(@Valid @RequestBody RunComplianceAuditRequest request) {
        ComplianceAuditReportResponse report = complianceService.runComplianceAudit(request, "SOC_AUDITOR");
        return ResponseEntity.ok(report);
    }

    @PostMapping("/controls/evidence")
    @Operation(summary = "Record Control Evidence", description = "Ingests control evidence proof for regulatory auditing.")
    public ResponseEntity<ComplianceControlItemResponse> recordControlEvidence(@Valid @RequestBody RecordControlEvidenceRequest request) {
        ComplianceControlItemResponse item = complianceService.recordControlEvidence(request);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/reports")
    @Operation(summary = "Get Audit Reports", description = "Retrieves historical compliance evaluation audit reports.")
    public ResponseEntity<List<ComplianceAuditReportResponse>> getAllAuditReports() {
        List<ComplianceAuditReportResponse> reports = complianceService.getAllAuditReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/controls")
    @Operation(summary = "Get Control Evidence Items", description = "Retrieves all control evidence entries.")
    public ResponseEntity<List<ComplianceControlItemResponse>> getAllControlItems() {
        List<ComplianceControlItemResponse> items = complianceService.getAllControlItems();
        return ResponseEntity.ok(items);
    }
}
