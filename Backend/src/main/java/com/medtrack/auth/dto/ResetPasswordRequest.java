package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ResetPasswordRequest is a Data Transfer Object (DTO) containing the fields
 * needed to reset a user's password.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload required to reset account password using an active recovery session")
public class ResetPasswordRequest {

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    @Schema(description = "Registered email address of the account", example = "hospital_admin@medtrack.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "OTP must not be blank")
    @Schema(description = "Verified 6-digit numeric recovery OTP code", example = "842106", requiredMode = Schema.RequiredMode.REQUIRED)
    private String otp;

    @NotBlank(message = "New password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "New credentials password (minimum 6 characters)", example = "SecurePassword123!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
