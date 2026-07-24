package com.medtrack.auth.threat.repository;

import com.medtrack.auth.threat.model.SecurityThreatIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityThreatIncidentRepository extends JpaRepository<SecurityThreatIncident, Long> {
    Optional<SecurityThreatIncident> findByIncidentId(String incidentId);
    List<SecurityThreatIncident> findByStatus(String status);
    List<SecurityThreatIncident> findByThreatLevel(String threatLevel);
}
