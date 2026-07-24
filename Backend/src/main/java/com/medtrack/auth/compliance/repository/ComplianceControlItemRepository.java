package com.medtrack.auth.compliance.repository;

import com.medtrack.auth.compliance.model.ComplianceControlItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplianceControlItemRepository extends JpaRepository<ComplianceControlItem, Long> {
    List<ComplianceControlItem> findByFramework(String framework);
    List<ComplianceControlItem> findByReportId(String reportId);
    List<ComplianceControlItem> findByStatus(String status);
}
