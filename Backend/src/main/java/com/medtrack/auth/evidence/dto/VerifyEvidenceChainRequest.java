package com.medtrack.auth.evidence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyEvidenceChainRequest {

    @NotBlank(message = "Evidence ID is required")
    private String evidenceId;

    private String expectedHash;
}
