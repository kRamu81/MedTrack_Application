package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RegisterRequest is a Data Transfer Object (DTO) that encapsulates the registration payload
 * sent by a client during a new user account creation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload required to register a new user account")
public class RegisterRequest {

    @NotBlank(message = "Name must not be blank")
    @Schema(description = "Full name of the user", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "Organization must not be blank")
    @Schema(description = "Name of the affiliated hospital or supplier organization", example = "St. Mary Hospital", requiredMode = Schema.RequiredMode.REQUIRED)
    private String organization;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    @Schema(description = "Unique email address for user registration and login", example = "john.doe@medtrack.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Phone must not be blank")
    @Schema(description = "Contact phone number", example = "+15551234567", requiredMode = Schema.RequiredMode.REQUIRED)
    private String phone;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "Plain text password of minimum length 6", example = "SecurePass123!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @NotBlank(message = "Confirm password must not be blank")
    @Schema(description = "Confirmation matching the password field", example = "SecurePass123!", requiredMode = Schema.RequiredMode.REQUIRED)
    private String confirmPassword;

    @Schema(description = "Application access role (HOSPITAL, TECHNICIAN, or SUPPLIER)", example = "HOSPITAL", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String role;
}
