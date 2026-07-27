package com.medtrack.auth.observability.repository;

import com.medtrack.auth.observability.model.SecurityObservabilityPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityObservabilityPolicyRepository extends JpaRepository<SecurityObservabilityPolicy, Long> {
    Optional<SecurityObservabilityPolicy> findByPolicyName(String policyName);
}
