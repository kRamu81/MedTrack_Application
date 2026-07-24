package com.medtrack.auth.governance.repository;

import com.medtrack.auth.governance.model.SecurityGovernancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityGovernancePolicyRepository extends JpaRepository<SecurityGovernancePolicy, Long> {
    Optional<SecurityGovernancePolicy> findByPolicyName(String policyName);
}
