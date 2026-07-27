package com.medtrack.auth.posture.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordPostureCheckRequest {

    @NotBlank(message = "Control ID is required")
    private String controlId;

    @NotBlank(message = "Control name is required")
    private String controlName;

    @NotBlank(message = "Domain category is required")
    private String domainCategory; // IAM_GOVERNANCE, ENCRYPTION_HEALTH, NETWORK_PERIMETER, VULNERABILITY_HEALTH

    @NotBlank(message = "Compliance status is required")
    private String complianceStatus; // COMPLIANT, NON_COMPLIANT, NEEDS_REMEDIATION

    private String evidenceDetails;
}
