package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * VerifyOtpRequest is a Data Transfer Object (DTO) for validating the OTP
 * code for a given email address.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload required to verify a password recovery OTP code")
public class VerifyOtpRequest {

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    @Schema(description = "Registered email address associated with the recovery session", example = "hospital_admin@medtrack.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "OTP must not be blank")
    @Schema(description = "6-digit numeric OTP verification code", example = "842106", requiredMode = Schema.RequiredMode.REQUIRED)
    private String otp;
}
