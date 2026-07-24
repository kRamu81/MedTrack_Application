package com.medtrack.auth.governance.repository;

import com.medtrack.auth.governance.model.ComplianceAuditReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplianceAuditReportRepository extends JpaRepository<ComplianceAuditReport, Long> {
    List<ComplianceAuditReport> findByOverallStatus(String overallStatus);
}
