package com.medtrack.auth.posture.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostureControlAssessmentResponse {
    private Long id;
    private String controlId;
    private String controlName;
    private String domainCategory;
    private String complianceStatus;
    private String evidenceDetails;
    private String evaluationId;
    private LocalDateTime assessedAt;
}
