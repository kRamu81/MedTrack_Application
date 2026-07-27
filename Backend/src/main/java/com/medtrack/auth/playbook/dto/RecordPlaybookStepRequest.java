package com.medtrack.auth.playbook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordPlaybookStepRequest {

    @NotBlank(message = "Execution ID is required")
    private String executionId;

    @NotBlank(message = "Step ID is required")
    private String stepId;

    @NotBlank(message = "Step name is required")
    private String stepName; // REVOKE_JWT_TOKENS, IP_FIREWALL_BLOCK, NOTIFY_SOC_LEAD

    @NotBlank(message = "Step status is required")
    private String stepStatus; // COMPLETED, FAILED, SKIPPED

    private String stepDetails;
}
