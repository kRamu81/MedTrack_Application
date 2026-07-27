package com.medtrack.auth.playbook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriggerPlaybookExecutionRequest {

    @NotBlank(message = "Playbook name is required")
    private String playbookName;

    @NotBlank(message = "Trigger event is required")
    private String triggerEvent; // BRUTE_FORCE, UNAUTHORIZED_ROLE_ESCALATION

    @NotBlank(message = "Affected asset is required")
    private String affectedAsset; // e.g., user:sarah.connor or ip:192.168.1.105

    private String customNotes;
}
