package com.medtrack.auth.evidence.repository;

import com.medtrack.auth.evidence.model.ComplianceEvidencePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplianceEvidencePolicyRepository extends JpaRepository<ComplianceEvidencePolicy, Long> {
    Optional<ComplianceEvidencePolicy> findByPolicyName(String policyName);
}
