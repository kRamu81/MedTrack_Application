package com.medtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for authentication responses.
 * Returns authenticated user details along with the issued JWT token.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    
    // JWT access token for subsequent authenticated API requests
    private String token;

    // Token validity duration in milliseconds, so frontend can schedule auto-logout
    private Long expiresIn;
}
