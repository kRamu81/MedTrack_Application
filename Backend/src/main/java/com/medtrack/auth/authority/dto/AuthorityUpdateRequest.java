package com.medtrack.auth.authority.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for requesting authority version updates or authority revocations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityUpdateRequest {

    @NotNull(message = "Target user ID is required")
    private Long userId;

    @NotBlank(message = "Reason for authority update is required")
    private String reason;

    private String updatedBy;
}
