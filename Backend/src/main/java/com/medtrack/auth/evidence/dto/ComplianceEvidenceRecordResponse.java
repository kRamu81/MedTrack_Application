package com.medtrack.auth.evidence.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceEvidenceRecordResponse {
    private Long id;
    private String evidenceId;
    private String frameworkStandard;
    private String controlReference;
    private String evidenceType;
    private String fileHashSha256;
    private String storageUri;
    private String verificationStatus;
    private String ingestedBy;
    private String evidenceDescription;
    private LocalDateTime ingestedAt;
}
