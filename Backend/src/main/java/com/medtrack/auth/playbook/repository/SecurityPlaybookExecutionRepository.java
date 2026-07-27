package com.medtrack.auth.playbook.repository;

import com.medtrack.auth.playbook.model.SecurityPlaybookExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityPlaybookExecutionRepository extends JpaRepository<SecurityPlaybookExecution, Long> {
    Optional<SecurityPlaybookExecution> findByExecutionId(String executionId);
    List<SecurityPlaybookExecution> findByPlaybookName(String playbookName);
    List<SecurityPlaybookExecution> findByExecutionStatus(String executionStatus);
}
