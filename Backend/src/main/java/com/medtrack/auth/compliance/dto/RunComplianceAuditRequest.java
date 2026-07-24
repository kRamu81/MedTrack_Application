package com.medtrack.auth.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RunComplianceAuditRequest {

    @NotBlank(message = "Framework standard is required")
    private String frameworkStandard; // SOC2_TYPE2, HIPAA_HITECH, GDPR_ARTICLE32, ISO_27001

    private String evaluatorNotes;
}
