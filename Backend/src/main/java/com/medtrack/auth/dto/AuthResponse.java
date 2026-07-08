package com.medtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse is a Data Transfer Object (DTO) that represents the response payload
 * returned to the client upon successful authentication (either login or registration).
 *
 * <p>This object conveys the user's basic profile details alongside the generated JSON Web Token (JWT)
 * and its lifetime, allowing the client application to manage session state and authorize subsequent requests.</p>
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Data}: Lombok annotation that automatically generates boilerplate code including getters, setters, {@code equals()}, {@code hashCode()}, and a {@code toString()} method.</li>
 *   <li>{@code @Builder}: Lombok annotation implementing the Builder design pattern, enabling fluent object construction.</li>
 *   <li>{@code @NoArgsConstructor}: Lombok annotation that generates an empty (no-argument) constructor, required for JSON deserialization.</li>
 *   <li>{@code @AllArgsConstructor}: Lombok annotation that generates a constructor accepting arguments for all fields.</li>
 * </ul>
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * Unique database identifier of the authenticated user.
     */
    private Long id;

    /**
     * The full name of the user.
     */
    private String name;

    /**
     * The unique username of the user.
     */
    private String username;

    /**
     * The registered email address of the user, which also serves as their login identifier.
     */
    private String email;

    /**
     * The security role assigned to the user (e.g., "ROLE_HOSPITAL", "ROLE_TECHNICIAN", "ROLE_SUPPLIER").
     * This role dictates their authorization access level across backend APIs.
     */
    private String role;
    
    /**
     * The generated JSON Web Token (JWT). The client must include this token in the "Authorization" header
     * prefixed with "Bearer " to access protected APIs.
     */
    private String token;

    /**
     * Token expiration duration in milliseconds from the time of creation.
     * Helpful for frontend applications to track session lifetime and automatically initiate logout.
     */
    private Long expiresIn;

    /**
     * The database-backed refresh token used to obtain a new access token.
     */
    private String refreshToken;
}
