package com.medtrack.auth.keyvault.repository;

import com.medtrack.auth.keyvault.model.KeyVaultAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KeyVaultAuditLogRepository extends JpaRepository<KeyVaultAuditLog, Long> {
    List<KeyVaultAuditLog> findByKeyId(String keyId);
    List<KeyVaultAuditLog> findByOperation(String operation);
}
