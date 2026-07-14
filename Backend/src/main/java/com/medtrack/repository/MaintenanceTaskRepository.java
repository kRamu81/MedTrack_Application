package com.medtrack.repository;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.model.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {
    Optional<MaintenanceTask> findByTaskCode(String taskCode);
    List<MaintenanceTask> findByAssignedTechnician(String assignedTechnician);
    // Ownership-scoped queries prevent cross-hospital and cross-technician record access.
    List<MaintenanceTask> findByHospitalId(Long hospitalId);
    Optional<MaintenanceTask> findByIdAndHospitalId(Long id, Long hospitalId);
    Optional<MaintenanceTask> findByIdAndAssignedTechnician(Long id, String assignedTechnician);
    List<MaintenanceTask> findByStatus(MaintenanceStatus status);

    // Equipment history remains hospital-scoped so it cannot leak another hospital's records.
    List<MaintenanceTask> findByEquipmentRecord_IdAndHospitalId(Long equipmentId, Long hospitalId);
}
