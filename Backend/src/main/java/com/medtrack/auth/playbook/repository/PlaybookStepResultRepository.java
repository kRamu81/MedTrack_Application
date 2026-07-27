package com.medtrack.auth.playbook.repository;

import com.medtrack.auth.playbook.model.PlaybookStepResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaybookStepResultRepository extends JpaRepository<PlaybookStepResult, Long> {
    List<PlaybookStepResult> findByExecutionId(String executionId);
    List<PlaybookStepResult> findByStepStatus(String stepStatus);
}
