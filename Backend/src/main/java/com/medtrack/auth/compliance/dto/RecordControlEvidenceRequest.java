package com.medtrack.auth.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordControlEvidenceRequest {

    @NotBlank(message = "Control code is required")
    private String controlCode;

    @NotBlank(message = "Control name is required")
    private String controlName;

    @NotBlank(message = "Framework standard is required")
    private String framework;

    @NotBlank(message = "Status is required")
    private String status; // COMPLIANT, NON_COMPLIANT, PARTIAL

    private String evidenceDetails;
}
