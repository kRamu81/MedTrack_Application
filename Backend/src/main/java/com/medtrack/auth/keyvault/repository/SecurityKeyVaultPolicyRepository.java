package com.medtrack.auth.keyvault.repository;

import com.medtrack.auth.keyvault.model.SecurityKeyVaultPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityKeyVaultPolicyRepository extends JpaRepository<SecurityKeyVaultPolicy, Long> {
    Optional<SecurityKeyVaultPolicy> findByPolicyName(String policyName);
}
