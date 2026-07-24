package com.medtrack.auth.threat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreatContainmentActionResponse {
    private Long id;
    private String incidentId;
    private String actionType;
    private String executedBy;
    private String status;
    private String actionNotes;
    private LocalDateTime executedAt;
}
