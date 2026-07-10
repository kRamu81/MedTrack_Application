package com.medtrack.auth.dto;

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
public class RegisterRequest {

    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotBlank(message = "Organization must not be blank")
    private String organization;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone must not be blank")
    private String phone;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Confirm password must not be blank")
    private String confirmPassword;

    private String role;
}
