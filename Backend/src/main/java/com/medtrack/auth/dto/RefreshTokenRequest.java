package com.medtrack.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RefreshTokenRequest is a Data Transfer Object (DTO) containing the refresh token string
 * passed by the client during token refresh and logout operations.
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Data}: Lombok annotation for generating getters, setters, toString, equals, and hashCode.</li>
 *   <li>{@code @NoArgsConstructor}: Lombok annotation generating a no-args constructor.</li>
 *   <li>{@code @AllArgsConstructor}: Lombok annotation generating an all-args constructor.</li>
 * </ul>
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {

    /**
     * The database-backed UUID refresh token string.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @NotBlank}: Refresh token cannot be null, empty, or consist entirely of whitespace characters.</li>
     * </ul>
     */
    @NotBlank(message = "Refresh token must not be blank")
    private String refreshToken;
}
