package com.medtrack.auth.threat.controller;

import com.medtrack.auth.threat.dto.*;
import com.medtrack.auth.threat.service.SecurityThreatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Threat Intelligence, Anomaly Evaluation, and Automated SOAR Incident Response.
 */
@RestController
@RequestMapping("/api/auth/threat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Threat Intelligence & SOAR Incident Response", description = "APIs for anomaly detection policies, threat incidents, and SOAR containment execution.")
public class SecurityThreatController {

    private final SecurityThreatService threatService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Threat Policy", description = "Retrieves active threat sensitivity and SOAR containment policy.")
    public ResponseEntity<ThreatPolicyResponse> getActivePolicy() {
        ThreatPolicyResponse policy = threatService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Threat Policy", description = "Updates anomaly risk thresholds and auto-containment triggers.")
    public ResponseEntity<ThreatPolicyResponse> updatePolicy(@Valid @RequestBody ThreatPolicyUpdateRequest request) {
        ThreatPolicyResponse updated = threatService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/incidents")
    @Operation(summary = "Report Threat Incident", description = "Ingests a security threat incident and triggers SOAR evaluation.")
    public ResponseEntity<SecurityThreatIncidentResponse> reportIncident(@Valid @RequestBody ReportThreatIncidentRequest request) {
        SecurityThreatIncidentResponse reported = threatService.reportIncident(request);
        return ResponseEntity.ok(reported);
    }

    @PostMapping("/containment")
    @Operation(summary = "Execute SOAR Containment", description = "Executes containment actions (e.g. IP ban, account lockout, session revoke).")
    public ResponseEntity<ThreatContainmentActionResponse> executeContainment(@Valid @RequestBody ExecuteContainmentRequest request) {
        ThreatContainmentActionResponse executed = threatService.executeContainment(request, "SOC_ADMIN");
        return ResponseEntity.ok(executed);
    }

    @PostMapping("/incidents/{incidentId}/resolve")
    @Operation(summary = "Resolve Incident", description = "Marks a security threat incident as resolved.")
    public ResponseEntity<SecurityThreatIncidentResponse> resolveIncident(@PathVariable String incidentId) {
        SecurityThreatIncidentResponse resolved = threatService.resolveIncident(incidentId);
        return ResponseEntity.ok(resolved);
    }

    @GetMapping("/incidents")
    @Operation(summary = "Get All Incidents", description = "Retrieves all recorded threat incidents.")
    public ResponseEntity<List<SecurityThreatIncidentResponse>> getAllIncidents() {
        List<SecurityThreatIncidentResponse> list = threatService.getAllIncidents();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/containment-actions")
    @Operation(summary = "Get Containment Audit Logs", description = "Retrieves historical SOAR containment execution logs.")
    public ResponseEntity<List<ThreatContainmentActionResponse>> getAllContainmentActions() {
        List<ThreatContainmentActionResponse> logs = threatService.getAllContainmentActions();
        return ResponseEntity.ok(logs);
    }
}
