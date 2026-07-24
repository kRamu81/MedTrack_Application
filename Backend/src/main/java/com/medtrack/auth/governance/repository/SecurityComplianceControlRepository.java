package com.medtrack.auth.governance.repository;

import com.medtrack.auth.governance.model.SecurityComplianceControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityComplianceControlRepository extends JpaRepository<SecurityComplianceControl, Long> {
    Optional<SecurityComplianceControl> findByControlCode(String controlCode);
    List<SecurityComplianceControl> findByFramework(String framework);
    List<SecurityComplianceControl> findByPassed(boolean passed);
}
