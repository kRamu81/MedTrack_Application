package com.medtrack.auth.scim.repository;

import com.medtrack.auth.scim.model.ScimProvisioningPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScimProvisioningPolicyRepository extends JpaRepository<ScimProvisioningPolicy, Long> {
    Optional<ScimProvisioningPolicy> findByPolicyName(String policyName);
}
