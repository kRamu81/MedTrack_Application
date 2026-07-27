package com.medtrack.auth.posture.repository;

import com.medtrack.auth.posture.model.SecurityPosturePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityPosturePolicyRepository extends JpaRepository<SecurityPosturePolicy, Long> {
    Optional<SecurityPosturePolicy> findByPolicyName(String policyName);
}
