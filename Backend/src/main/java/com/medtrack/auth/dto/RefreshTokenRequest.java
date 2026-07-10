package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Payload containing UUID refresh token key")
public class RefreshTokenRequest {

    /**
     * The database-backed UUID refresh token string.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @NotBlank}: Refresh token cannot be null, empty, or consist entirely of whitespace characters.</li>
     * </ul>
     */
    @NotBlank(message = "Refresh token must not be blank")
    @Schema(description = "UUID string representing the active refresh token", example = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", requiredMode = Schema.RequiredMode.REQUIRED)
    private String refreshToken;
}
