package com.medtrack.auth.rbac.repository;

import com.medtrack.auth.rbac.model.SecurityRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA Repository for managing RBAC roles.
 */
@Repository
public interface SecurityRoleRepository extends JpaRepository<SecurityRole, Long> {

    Optional<SecurityRole> findByRoleName(String roleName);
}
