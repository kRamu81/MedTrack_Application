package com.medtrack.auth.evidence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngestEvidenceRecordRequest {

    @NotBlank(message = "Framework standard is required")
    private String frameworkStandard; // SOC2, HIPAA, ISO27001

    @NotBlank(message = "Control reference is required")
    private String controlReference; // CC6.1, HIPAA-164.312

    @NotBlank(message = "Evidence type is required")
    private String evidenceType; // LOG_EXPORT, ACCESS_MATRIX, AUDIT_TRAIL_DUMP

    @NotBlank(message = "Storage URI is required")
    private String storageUri;

    private String evidenceDescription;
}
