package com.medtrack.auth.rbac.repository;

import com.medtrack.auth.rbac.model.SecurityPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for security permissions.
 */
@Repository
public interface SecurityPermissionRepository extends JpaRepository<SecurityPermission, Long> {

    Optional<SecurityPermission> findByPermissionCode(String permissionCode);

    List<SecurityPermission> findByResourceCategory(String resourceCategory);
}
