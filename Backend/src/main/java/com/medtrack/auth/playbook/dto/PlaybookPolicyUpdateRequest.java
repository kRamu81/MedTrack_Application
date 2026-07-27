package com.medtrack.auth.playbook.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookPolicyUpdateRequest {

    @NotBlank(message = "Playbook name is required")
    private String playbookName;

    @NotBlank(message = "Trigger event is required")
    private String triggerEvent; // BRUTE_FORCE, UNAUTHORIZED_ROLE_ESCALATION

    @NotBlank(message = "Default containment action is required")
    private String defaultContainmentAction; // REVOKE_TOKENS_AND_BAN_IP, ISOLATE_HOST

    @NotBlank(message = "Execution mode is required")
    private String executionMode; // AUTOMATIC, SEMI_AUTOMATIC, MANUAL_APPROVAL

    @Min(value = 0, message = "Cooldown minutes cannot be negative")
    private int cooldownMinutes;

    private boolean notifySocOnExecution;
}
