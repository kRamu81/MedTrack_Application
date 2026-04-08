package com.medtrack.repository;

import com.medtrack.model.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {
    Optional<MaintenanceTask> findByTaskCode(String taskCode);
    List<MaintenanceTask> findByAssignedTechnician(String assignedTechnician);
    List<MaintenanceTask> findByStatus(String status);
}
