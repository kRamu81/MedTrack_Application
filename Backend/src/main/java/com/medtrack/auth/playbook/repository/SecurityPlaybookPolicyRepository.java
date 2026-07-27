package com.medtrack.auth.playbook.repository;

import com.medtrack.auth.playbook.model.SecurityPlaybookPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityPlaybookPolicyRepository extends JpaRepository<SecurityPlaybookPolicy, Long> {
    Optional<SecurityPlaybookPolicy> findByPlaybookName(String playbookName);
}
