package com.medtrack.auth.threat.repository;

import com.medtrack.auth.threat.model.SecurityThreatPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityThreatPolicyRepository extends JpaRepository<SecurityThreatPolicy, Long> {
    Optional<SecurityThreatPolicy> findByPolicyName(String policyName);
}
