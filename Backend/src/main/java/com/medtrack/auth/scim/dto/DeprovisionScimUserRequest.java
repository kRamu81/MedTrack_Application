package com.medtrack.auth.scim.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeprovisionScimUserRequest {

    @NotBlank(message = "External IdP user ID is required")
    private String scimExternalId;

    private String deprovisionReason;
}
