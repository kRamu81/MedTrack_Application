package com.medtrack.auth.threat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecuteContainmentRequest {

    @NotBlank(message = "Incident ID is required")
    private String incidentId;

    @NotBlank(message = "Action type is required")
    private String actionType; // IP_BAN, ACCOUNT_LOCKOUT, REVOKE_SESSION, ISOLATE_USER

    private String actionNotes;
}
