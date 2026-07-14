package com.medtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing the JSON payload returned upon successful credentials verification.
 * Encapsulates verification status, contextual message, user profile metadata, and the bearer access token.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * Session validation status indicator.
     */
    private boolean success;

    /**
     * Contextual session verification response message.
     */
    private String message;

    /**
     * Nested profile metadata matching the authenticated entity.
     */
    private UserPayload user;

    /**
     * Signed short-lived authentication token for secure route headers.
     */
    private String token;

    /**
     * Nested class containing profile details exposed to client applications.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPayload {

        /** Database primary key identifier. */
        private Long id;

        /** Full name display value. */
        private String name;

        /** Registered email contact. */
        private String email;

        /** Optional phone contact. */
        private String phone;

        /** Assigned hospital organization or affiliate identity. */
        private String organization;

        /** Access privileges role claim. */
        private String role;
    }
}
