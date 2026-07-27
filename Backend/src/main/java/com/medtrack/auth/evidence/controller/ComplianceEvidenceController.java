package com.medtrack.auth.evidence.controller;

import com.medtrack.auth.evidence.dto.*;
import com.medtrack.auth.evidence.service.ComplianceEvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Compliance Evidence Vault & Cryptographic Audit Chain.
 */
@RestController
@RequestMapping("/api/auth/evidence")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Compliance Evidence Vault & Cryptographic Audit Chain", description = "APIs for ingesting immutable audit evidence, WORM vault rules, SHA-256 block sealing, and chain integrity verification.")
public class ComplianceEvidenceController {

    private final ComplianceEvidenceService evidenceService;

    @GetMapping("/policy")
    @Operation(summary = "Get Evidence Vault Policy", description = "Retrieves active compliance evidence retention and WORM policy settings.")
    public ResponseEntity<EvidencePolicyResponse> getActivePolicy() {
        EvidencePolicyResponse policy = evidenceService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Evidence Vault Policy", description = "Updates retention years, WORM immutability rules, and hash algorithms.")
    public ResponseEntity<EvidencePolicyResponse> updatePolicy(@Valid @RequestBody EvidencePolicyUpdateRequest request) {
        EvidencePolicyResponse updated = evidenceService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/records/ingest")
    @Operation(summary = "Ingest Evidence Record", description = "Ingests a new immutable compliance audit evidence record and seals it into the cryptographic chain.")
    public ResponseEntity<ComplianceEvidenceRecordResponse> ingestEvidenceRecord(@Valid @RequestBody IngestEvidenceRecordRequest request) {
        ComplianceEvidenceRecordResponse response = evidenceService.ingestEvidenceRecord(request, "AUDITOR_ADMIN");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chain/verify")
    @Operation(summary = "Verify Evidence Audit Chain", description = "Verifies cryptographic hash block integrity for an evidence item.")
    public ResponseEntity<EvidenceAuditChainLogResponse> verifyEvidenceChain(@Valid @RequestBody VerifyEvidenceChainRequest request) {
        EvidenceAuditChainLogResponse response = evidenceService.verifyEvidenceChain(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/records")
    @Operation(summary = "Get All Evidence Records", description = "Retrieves all ingested compliance evidence items.")
    public ResponseEntity<List<ComplianceEvidenceRecordResponse>> getAllRecords() {
        List<ComplianceEvidenceRecordResponse> records = evidenceService.getAllRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/chain/logs")
    @Operation(summary = "Get Audit Chain Blocks", description = "Retrieves all cryptographic audit chain blocks in the ledger.")
    public ResponseEntity<List<EvidenceAuditChainLogResponse>> getAllChainLogs() {
        List<EvidenceAuditChainLogResponse> logs = evidenceService.getAllChainLogs();
        return ResponseEntity.ok(logs);
    }
}
