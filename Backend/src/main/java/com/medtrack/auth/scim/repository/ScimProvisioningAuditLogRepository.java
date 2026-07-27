package com.medtrack.auth.scim.repository;

import com.medtrack.auth.scim.model.ScimProvisioningAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScimProvisioningAuditLogRepository extends JpaRepository<ScimProvisioningAuditLog, Long> {
    List<ScimProvisioningAuditLog> findByScimExternalId(String scimExternalId);
    List<ScimProvisioningAuditLog> findByActionType(String actionType);
}
