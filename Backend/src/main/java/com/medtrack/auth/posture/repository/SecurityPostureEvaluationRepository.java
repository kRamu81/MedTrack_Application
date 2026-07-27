package com.medtrack.auth.posture.repository;

import com.medtrack.auth.posture.model.SecurityPostureEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityPostureEvaluationRepository extends JpaRepository<SecurityPostureEvaluation, Long> {
    Optional<SecurityPostureEvaluation> findByEvaluationId(String evaluationId);
    List<SecurityPostureEvaluation> findByBenchmarkStandard(String benchmarkStandard);
    List<SecurityPostureEvaluation> findByRiskRating(String riskRating);
}
