package com.medtrack.auth.posture.controller;

import com.medtrack.auth.posture.dto.*;
import com.medtrack.auth.posture.service.SecurityPostureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Enterprise Security Posture & Real-Time Cyber Risk Scoring.
 */
@RestController
@RequestMapping("/api/auth/posture")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "Security Posture & Cyber Risk Scoring", description = "APIs for CIS Benchmark, NIST 800-53 evaluation scans, posture scorecards, and control checks.")
public class SecurityPostureController {

    private final SecurityPostureService postureService;

    @GetMapping("/policy")
    @Operation(summary = "Get Active Posture Policy", description = "Retrieves active security posture benchmark threshold policy.")
    public ResponseEntity<PosturePolicyResponse> getActivePolicy() {
        PosturePolicyResponse policy = postureService.getActivePolicy();
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/policy")
    @Operation(summary = "Update Posture Policy", description = "Updates posture threshold score and benchmark rules.")
    public ResponseEntity<PosturePolicyResponse> updatePolicy(@Valid @RequestBody PosturePolicyUpdateRequest request) {
        PosturePolicyResponse updated = postureService.updatePolicy(request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/evaluation/run")
    @Operation(summary = "Run Security Posture Audit", description = "Executes real-time benchmark evaluation scan.")
    public ResponseEntity<SecurityPostureEvaluationResponse> runPostureEvaluation(@Valid @RequestBody RunPostureEvaluationRequest request) {
        SecurityPostureEvaluationResponse evaluation = postureService.runPostureEvaluation(request, "POSTURE_AUDITOR");
        return ResponseEntity.ok(evaluation);
    }

    @PostMapping("/controls/check")
    @Operation(summary = "Record Posture Control Check", description = "Ingests posture control evidence details.")
    public ResponseEntity<PostureControlAssessmentResponse> recordPostureCheck(@Valid @RequestBody RecordPostureCheckRequest request) {
        PostureControlAssessmentResponse response = postureService.recordPostureCheck(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/evaluations")
    @Operation(summary = "Get Evaluation History", description = "Retrieves all historical posture assessment scans.")
    public ResponseEntity<List<SecurityPostureEvaluationResponse>> getAllEvaluations() {
        List<SecurityPostureEvaluationResponse> evaluations = postureService.getAllEvaluations();
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/controls")
    @Operation(summary = "Get Posture Control Checks", description = "Retrieves all posture domain control checks.")
    public ResponseEntity<List<PostureControlAssessmentResponse>> getAllControlAssessments() {
        List<PostureControlAssessmentResponse> assessments = postureService.getAllControlAssessments();
        return ResponseEntity.ok(assessments);
    }
}
