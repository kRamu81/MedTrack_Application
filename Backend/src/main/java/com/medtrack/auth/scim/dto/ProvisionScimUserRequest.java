package com.medtrack.auth.scim.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionScimUserRequest {

    @NotBlank(message = "External IdP user ID is required")
    private String scimExternalId;

    @NotBlank(message = "MedTrack username is required")
    private String medtrackUsername;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email address is required")
    private String email;

    @NotBlank(message = "Enterprise IdP provider is required")
    private String enterpriseIdpProvider; // OKTA, AZURE_AD, PING_IDENTITY

    @NotBlank(message = "Assigned role is required")
    private String assignedRole; // HOSPITAL_ADMIN, TECHNICIAN, SUPPLIER
}
