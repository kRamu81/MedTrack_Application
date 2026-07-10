package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse is a Data Transfer Object (DTO) that represents the response payload
 * returned to the client upon successful authentication (either login or registration).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Standard successful authentication response payload wrapping JWT access/refresh tokens and profile info")
public class AuthResponse {

    @Schema(description = "Operation status indicator", example = "true")
    private boolean success;

    @Schema(description = "Contextual success description message", example = "Login successful")
    private String message;

    @Schema(description = "Detailed profile of the authenticated user")
    private UserResponse user;

    @Schema(description = "Signed JWT access token for verifying authorization headers on secure routes", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    // Flat compatibility fields for legacy frontend support
    @Schema(description = "Database primary key ID of user (legacy flat response field)", example = "15")
    private Long id;

    @Schema(description = "Full name of the user (legacy flat response field)", example = "John Doe")
    private String name;

    @Schema(description = "Generated username of the user (legacy flat response field)", example = "john.doe")
    private String username;

    @Schema(description = "Primary email address of the user (legacy flat response field)", example = "john.doe@medtrack.com")
    private String email;

    @Schema(description = "User authorization role (legacy flat response field)", example = "HOSPITAL")
    private String role;

    @Schema(description = "Token expiration duration in milliseconds", example = "604800000")
    private Long expiresIn;

    @Schema(description = "UUID string used as a rotation token to fetch fresh access tokens", example = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
    private String refreshToken;
}
