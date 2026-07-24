package com.medtrack.auth.zerotrust.repository;

import com.medtrack.auth.zerotrust.model.SecurityPolicyViolationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityPolicyViolationRepository extends JpaRepository<SecurityPolicyViolationLog, Long> {
    List<SecurityPolicyViolationLog> findByIpAddress(String ipAddress);
    List<SecurityPolicyViolationLog> findByUserId(Long userId);
    List<SecurityPolicyViolationLog> findByResolved(boolean resolved);
}
