package com.medtrack.auth.rbac.repository;

import com.medtrack.auth.rbac.model.RolePermissionMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for role-to-permission mappings.
 */
@Repository
public interface RolePermissionMappingRepository extends JpaRepository<RolePermissionMapping, Long> {

    List<RolePermissionMapping> findByRoleId(Long roleId);

    Optional<RolePermissionMapping> findByRoleIdAndPermissionId(Long roleId, Long permissionId);

    void deleteByRoleIdAndPermissionId(Long roleId, Long permissionId);
}
