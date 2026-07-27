package com.medtrack.auth.playbook.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPlaybookExecutionResponse {
    private Long id;
    private String executionId;
    private String playbookName;
    private String triggerEvent;
    private String executedAction;
    private String executionStatus;
    private String affectedAsset;
    private String executedBy;
    private String executionSummary;
    private LocalDateTime executedAt;
}
