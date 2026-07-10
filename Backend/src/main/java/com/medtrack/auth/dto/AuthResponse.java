package com.medtrack.auth.dto;

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
public class AuthResponse {

    // Success response wrapper fields
    private boolean success;
    private String message;
    private UserResponse user;
    private String token;

    // Flat compatibility fields for legacy frontend support
    private Long id;
    private String name;
    private String username;
    private String email;
    private String role;
    private Long expiresIn;
    private String refreshToken;
}
