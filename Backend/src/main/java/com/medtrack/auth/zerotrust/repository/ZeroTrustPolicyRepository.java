package com.medtrack.auth.zerotrust.repository;

import com.medtrack.auth.zerotrust.model.ZeroTrustPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZeroTrustPolicyRepository extends JpaRepository<ZeroTrustPolicy, Long> {
    Optional<ZeroTrustPolicy> findByPolicyName(String policyName);
}
