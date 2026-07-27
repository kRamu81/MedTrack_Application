package com.medtrack.auth.playbook.controller;

import com.medtrack.auth.playbook.dto.*;
import com.medtrack.auth.playbook.service.SecurityPlaybookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Automated SOAR Security Containment Playbooks.
 */
@RestController
@RequestMapping("/api/auth/playbook")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Playbooks & Automated SOAR Containment", description = "APIs for executing automated threat containment playbooks, logging playbook steps, and managing SOAR policy rules.")
public class SecurityPlaybookController {

    private final SecurityPlaybookService playbookService;

    @GetMapping("/policy")
    @Operation(summary = "Get Playbook Policy", description = "Retrieves active automated SOAR playbook execution policy.")
    public ResponseEntity<PlaybookPolicyResponse> getActivePolicy() {
        PlaybookPolicyResponse policy = playbookService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Playbook Policy", description = "Updates default containment actions and execution modes.")
    public ResponseEntity<PlaybookPolicyResponse> updatePolicy(@Valid @RequestBody PlaybookPolicyUpdateRequest request) {
        PlaybookPolicyResponse updated = playbookService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/trigger")
    @Operation(summary = "Trigger Playbook Execution", description = "Executes an automated security containment playbook for a target asset.")
    public ResponseEntity<SecurityPlaybookExecutionResponse> triggerPlaybookExecution(@Valid @RequestBody TriggerPlaybookExecutionRequest request) {
        SecurityPlaybookExecutionResponse response = playbookService.triggerPlaybookExecution(request, "SOAR_CONTROLLER");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/steps/record")
    @Operation(summary = "Record Playbook Step", description = "Records step-by-step action result for an active playbook run.")
    public ResponseEntity<PlaybookStepResultResponse> recordPlaybookStep(@Valid @RequestBody RecordPlaybookStepRequest request) {
        PlaybookStepResultResponse response = playbookService.recordPlaybookStep(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/executions")
    @Operation(summary = "Get Playbook Executions", description = "Retrieves all historical automated playbook runs.")
    public ResponseEntity<List<SecurityPlaybookExecutionResponse>> getAllExecutions() {
        List<SecurityPlaybookExecutionResponse> executions = playbookService.getAllExecutions();
        return ResponseEntity.ok(executions);
    }

    @GetMapping("/steps/{executionId}")
    @Operation(summary = "Get Playbook Step Logs", description = "Retrieves granular step action logs for an execution ID.")
    public ResponseEntity<List<PlaybookStepResultResponse>> getStepsByExecutionId(@PathVariable String executionId) {
        List<PlaybookStepResultResponse> steps = playbookService.getStepsByExecutionId(executionId);
        return ResponseEntity.ok(steps);
    }
}
