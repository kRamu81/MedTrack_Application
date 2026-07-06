package com.medtrack.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * RefreshToken represents a database-backed token used to request new access tokens
 * without requiring the user to re-authenticate with their credentials.
 * Unlike access tokens, refresh tokens are stored in the database, can be revoked,
 * and have a longer lifetime.
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Entity}: Marks this class as a JPA entity.</li>
 *   <li>{@code @Table}: Specifies the table mapping in the database.</li>
 *   <li>{@code @Data}: Lombok annotation for generating getters, setters, toString, equals, and hashCode.</li>
 *   <li>{@code @Builder}: Lombok annotation implementing the Builder pattern.</li>
 *   <li>{@code @NoArgsConstructor}: Lombok annotation for generating a default constructor.</li>
 *   <li>{@code @AllArgsConstructor}: Lombok annotation for generating an all-args constructor.</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "refresh_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    /**
     * Unique identifier for the refresh token record, serving as the primary key.
     * The strategy is configured to use database identity generation (autoincrement).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The random UUID string representing the refresh token (not a JWT).
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Column(nullable = false, unique = true, length = 100)}: Database schema constraint preventing nulls and duplicates.</li>
     * </ul>
     */
    @Column(nullable = false, unique = true, length = 100)
    private String token;

    /**
     * The database ID of the user associated with this refresh token.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null values.</li>
     * </ul>
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * The expiration timestamp for the refresh token.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null values.</li>
     * </ul>
     */
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /**
     * Flag indicating whether the token has been manually revoked (e.g., on logout).
     * Defaults to false.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null values.</li>
     *   <li>{@code @Builder.Default}: Lombok builder setting to keep the default value false.</li>
     * </ul>
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean revoked = false;
}
