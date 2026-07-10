package com.medtrack.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ForgotPasswordRequest is a Data Transfer Object (DTO) for capturing the email
 * address during the forgot password request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    private String email;
}
