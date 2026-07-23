package com.medtrack.auth.rbac.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * JPA entity representing a system or custom RBAC access control role.
 */
@Entity
@Table(name = "security_roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roleName; // e.g. "ROLE_ADMIN", "ROLE_BIOMED_ENGINEER", "ROLE_DOCTOR"

    private String description;

    @Column(nullable = false)
    private boolean systemRole; // true if built-in system default role

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
