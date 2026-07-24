package com.medtrack.auth.compliance.repository;

import com.medtrack.auth.compliance.model.CompliancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompliancePolicyRepository extends JpaRepository<CompliancePolicy, Long> {
    Optional<CompliancePolicy> findByPolicyName(String policyName);
}
