package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object capturing credentials submitted during authentication sequences.
 * Enforces syntax format checks prior to executing database lookups or matching credentials.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload required to authenticate user credentials")
public class LoginRequest {

    /**
     * Authenticating user email address. Enforces email format validation.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Schema(description = "Registered email address associated with the user account", example = "john.doe@medtrack.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    /**
     * Account password credentials. Checked against stored BCrypt hashes.
     */
    @NotBlank(message = "Password is required")
    @Schema(description = "Account login password credentials", example = "SecurePass123!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    /**
     * System access role requested for authorization context.
     * Restricts login to valid platform roles (HOSPITAL, TECHNICIAN, SUPPLIER).
     */
    @NotBlank(message = "Role is required")
    @Pattern(
        regexp = "(?i)^(HOSPITAL|TECHNICIAN|SUPPLIER)$",
        message = "Role must be one of: HOSPITAL, TECHNICIAN, SUPPLIER"
    )
    @Schema(description = "Requested workspace role for session authorization (HOSPITAL, TECHNICIAN, or SUPPLIER)", example = "HOSPITAL", requiredMode = Schema.RequiredMode.REQUIRED)
    private String role;
}
