package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for capturing the email address during forgot password requests.
 * Used to target the specific account that requires a verification pin reset sequence.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload required to initiate the password recovery flow")
public class ForgotPasswordRequest {

    /**
     * Account email address to receive recovery instructions and OTP pins.
     */
    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    @Schema(description = "Registered email address associated with the user account", example = "hospital_admin@medtrack.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}
