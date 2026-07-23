package com.medtrack.auth.rbac.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing a granular permission policy code.
 */
@Entity
@Table(name = "security_permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String permissionCode; // e.g. "EQUIPMENT:READ", "MAINTENANCE:APPROVE", "SSO:CONFIGURE"

    @Column(nullable = false)
    private String resourceCategory; // e.g. "EQUIPMENT", "MAINTENANCE", "SECURITY", "SSO"

    private String description;
}
