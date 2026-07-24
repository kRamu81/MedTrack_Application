package com.medtrack.auth.governance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceControlResponse {
    private Long id;
    private String controlCode;
    private String controlName;
    private String framework;
    private String description;
    private boolean passed;
    private String severity;
    private LocalDateTime lastEvaluatedAt;
}
