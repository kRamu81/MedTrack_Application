package com.medtrack.auth.compliance.repository;

import com.medtrack.auth.compliance.model.ComplianceAuditReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceAuditReportRepository extends JpaRepository<ComplianceAuditReport, Long> {
    Optional<ComplianceAuditReport> findByReportId(String reportId);
    List<ComplianceAuditReport> findByFrameworkStandard(String frameworkStandard);
    List<ComplianceAuditReport> findByStatus(String status);
}
