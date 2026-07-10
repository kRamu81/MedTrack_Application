package com.medtrack.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginRequest is a Data Transfer Object (DTO) that encapsulates user login credentials
 * submitted via HTTP POST request to the authentication endpoint.
 *
 * <p>This object enforces validation rules to verify that required fields are present and
 * correctly formatted prior to executing authenticating logic.</p>
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Data}: Lombok annotation that generates getter, setter, {@code toString()}, {@code equals()}, and {@code hashCode()} methods.</li>
 *   <li>{@code @NoArgsConstructor}: Lombok annotation generating a no-argument constructor, essential for JSON parsing frameworks.</li>
 *   <li>{@code @AllArgsConstructor}: Lombok annotation generating a constructor with all arguments.</li>
 * </ul>
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * User's registered email address used as the unique username/login identifier.
     * Enforces constraints:
     * <ul>
      *   <li>{@code @NotBlank}: Email cannot be null, empty, or consist entirely of whitespace characters.</li>
     *   <li>{@code @Email}: Validates that the input follows a standard, syntactically correct email format.</li>
     * </ul>
     */
    @NotBlank
    @Email
    private String email;

    /**
     * Raw text password supplied by the user.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @NotBlank}: Password cannot be null, empty, or consist entirely of whitespace characters.</li>
     * </ul>
     */
    @NotBlank
    private String password;
}
