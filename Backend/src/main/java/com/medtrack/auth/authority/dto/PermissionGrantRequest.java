package com.medtrack.auth.authority.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for granting or revoking fine-grained security permissions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionGrantRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Permission string is required")
    private String permission;

    @NotBlank(message = "Reason for permission modification is required")
    private String reason;

    private String updatedBy;
}
