package com.medtrack.auth.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User represents the persistent entity stored in the database for application users.
 * It maps to the "users" table and stores authentication credentials, profile details,
 * and security roles (hospital, technician, or supplier).
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Entity}: JPA annotation marking this class as a database-backed entity.</li>
 *   <li>{@code @Table}: Specifies the table name mapping and enforces a database-level unique constraint on the email column.</li>
 *   <li>{@code @Data}: Lombok annotation to auto-generate getters, setters, {@code toString()}, {@code equals()}, and {@code hashCode()}.</li>
 *   <li>{@code @Builder}: Lombok annotation implementing the Builder pattern for object instantiations.</li>
 *   <li>{@code @NoArgsConstructor}: Lombok annotation generating a default no-argument constructor.</li>
 *   <li>{@code @AllArgsConstructor}: Lombok annotation generating an all-fields constructor.</li>
 * </ul>
 * </p>
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /**
     * Unique identifier for the user record, serving as the primary key.
     * The strategy is configured to use database identity generation (autoincrement).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User's full name.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @NotBlank}: Input validation ensuring name is not empty or whitespaces.</li>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null values.</li>
     * </ul>
     */
    @NotBlank
    @Column(nullable = false)
    private String name;

    /**
     * User's unique username for identification.
     */
    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * User's email address, which acts as their unique identifier for login.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Email}: Formats input checks to verify valid email format.</li>
     *   <li>{@code @NotBlank}: Input validation ensuring email is supplied.</li>
     *   <li>{@code @Column(nullable = false, unique = true)}: Database constraint ensuring it is non-null and globally unique across all users.</li>
     * </ul>
     */
    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hashed password for the user.
     * Enforces constraints:
     * <ul>
     *   <li>{@code @NotBlank}: Input validation ensuring password is provided.</li>
     *   <li>{@code @Size(min = 6)}: Validates password must contain at least 6 characters.</li>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null values.</li>
     * </ul>
     */
    @NotBlank
    @Size(min = 6)
    @Column(nullable = false)
    private String password;

    /**
     * User roles used for authorization checks: "hospital", "technician", or "supplier".
     * Matches the role selection on the React frontend.
     * Defaults to "hospital".
     * Enforces constraints:
     * <ul>
     *   <li>{@code @Column(nullable = false)}: Database schema constraint preventing null roles.</li>
     *   <li>{@code @Builder.Default}: Lombok builder setting to keep the default value "hospital" if no role is explicitly passed.</li>
     * </ul>
     */
    @Column(nullable = false)
    @Builder.Default
    private String role = "hospital";

    /**
     * Security and activity status of the user account.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;
}
