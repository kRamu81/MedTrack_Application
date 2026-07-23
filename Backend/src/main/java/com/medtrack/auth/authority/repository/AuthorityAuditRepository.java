package com.medtrack.auth.authority.repository;

import com.medtrack.auth.authority.model.AuthorityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing persistent authority audit records.
 */
@Repository
public interface AuthorityAuditRepository extends JpaRepository<AuthorityAuditLog, Long> {

    /**
     * Finds all authority audit logs associated with a specific user ID.
     *
     * @param userId user database primary key
     * @return ordered list of audit logs for the user
     */
    List<AuthorityAuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Finds audit logs by event type.
     *
     * @param eventType type of event (e.g., VERSION_INCREMENT)
     * @return list of matching audit log entities
     */
    List<AuthorityAuditLog> findByEventTypeOrderByTimestampDesc(String eventType);
}
