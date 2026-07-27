package com.medtrack.auth.evidence.repository;

import com.medtrack.auth.evidence.model.EvidenceAuditChainLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceAuditChainLogRepository extends JpaRepository<EvidenceAuditChainLog, Long> {
    Optional<EvidenceAuditChainLog> findByEvidenceId(String evidenceId);
    Optional<EvidenceAuditChainLog> findTopByOrderByBlockIndexDesc();
    List<EvidenceAuditChainLog> findByLedgerStatus(String ledgerStatus);
}
