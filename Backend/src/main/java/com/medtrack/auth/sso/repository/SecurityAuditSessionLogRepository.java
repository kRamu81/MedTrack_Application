package com.medtrack.auth.sso.repository;

import com.medtrack.auth.sso.model.SecurityAuditSessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for security audit session log query operations.
 */
@Repository
public interface SecurityAuditSessionLogRepository extends JpaRepository<SecurityAuditSessionLog, Long> {

    /**
     * Finds security audit logs for a specific user ID, ordered by timestamp descending.
     *
     * @param userId user database primary key
     * @return list of audit log entities
     */
    List<SecurityAuditSessionLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Finds audit logs flagged with suspicious activity.
     *
     * @return list of high risk security logs
     */
    List<SecurityAuditSessionLog> findBySuspiciousActivityTrueOrderByTimestampDesc();
}
