package com.medtrack.auth.posture.repository;

import com.medtrack.auth.posture.model.PostureControlAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostureControlAssessmentRepository extends JpaRepository<PostureControlAssessment, Long> {
    List<PostureControlAssessment> findByDomainCategory(String domainCategory);
    List<PostureControlAssessment> findByEvaluationId(String evaluationId);
    List<PostureControlAssessment> findByComplianceStatus(String complianceStatus);
}
