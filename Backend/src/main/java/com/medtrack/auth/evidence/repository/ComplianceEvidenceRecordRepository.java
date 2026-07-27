package com.medtrack.auth.evidence.repository;

import com.medtrack.auth.evidence.model.ComplianceEvidenceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceEvidenceRecordRepository extends JpaRepository<ComplianceEvidenceRecord, Long> {
    Optional<ComplianceEvidenceRecord> findByEvidenceId(String evidenceId);
    List<ComplianceEvidenceRecord> findByFrameworkStandard(String frameworkStandard);
    List<ComplianceEvidenceRecord> findByVerificationStatus(String verificationStatus);
}
