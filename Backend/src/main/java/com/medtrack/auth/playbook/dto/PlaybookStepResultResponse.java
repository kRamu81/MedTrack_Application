package com.medtrack.auth.playbook.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookStepResultResponse {
    private Long id;
    private String stepId;
    private String stepName;
    private String stepStatus;
    private String stepDetails;
    private String executionId;
    private LocalDateTime executedAt;
}
