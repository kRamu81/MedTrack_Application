package com.medtrack.auth.compliance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceControlItemResponse {
    private Long id;
    private String controlCode;
    private String controlName;
    private String framework;
    private String status;
    private String evidenceDetails;
    private String reportId;
    private LocalDateTime evaluatedAt;
}
