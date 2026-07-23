package com.medtrack.auth.rbac.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * JPA Join entity mapping SecurityRole to SecurityPermission policy entries.
 */
@Entity
@Table(name = "role_permission_mappings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role_id", "permission_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private SecurityRole role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permission_id", nullable = false)
    private SecurityPermission permission;

    private String conditionalDepartment;

    private LocalDateTime assignedAt;
}
