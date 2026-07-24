package com.medtrack.auth.zerotrust.repository;

import com.medtrack.auth.zerotrust.model.IpThreatReputationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IpThreatReputationRepository extends JpaRepository<IpThreatReputationLog, Long> {
    Optional<IpThreatReputationLog> findByIpAddress(String ipAddress);
    List<IpThreatReputationLog> findByBlocked(boolean blocked);
    List<IpThreatReputationLog> findByThreatLevel(String threatLevel);
}
