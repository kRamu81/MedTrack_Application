package com.medtrack.auth.playbook.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookPolicyResponse {
    private Long id;
    private String playbookName;
    private String triggerEvent;
    private String defaultContainmentAction;
    private String executionMode;
    private int cooldownMinutes;
    private boolean notifySocOnExecution;
    private LocalDateTime updatedAt;
}
