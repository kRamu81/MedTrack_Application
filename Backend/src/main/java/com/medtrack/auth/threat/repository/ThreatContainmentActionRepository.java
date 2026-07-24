package com.medtrack.auth.threat.repository;

import com.medtrack.auth.threat.model.ThreatContainmentAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreatContainmentActionRepository extends JpaRepository<ThreatContainmentAction, Long> {
    List<ThreatContainmentAction> findByIncidentId(String incidentId);
    List<ThreatContainmentAction> findByStatus(String status);
}
