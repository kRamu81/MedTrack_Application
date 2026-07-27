package com.medtrack.repository;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.model.MaintenanceStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {
    Optional<MaintenanceTask> findByTaskCode(String taskCode);

    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.assignedTechnician = :assignedTechnician "
            + "AND task.equipmentRecord.hospital.id = task.hospitalId")
    List<MaintenanceTask> findByAssignedTechnician(
            @Param("assignedTechnician") String assignedTechnician);

    // Ownership-scoped queries prevent cross-hospital and cross-technician record access.
    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.hospitalId = :hospitalId "
            + "AND task.equipmentRecord.hospital.id = :hospitalId")
    List<MaintenanceTask> findByHospitalId(@Param("hospitalId") Long hospitalId);

    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.hospitalId = :hospitalId "
            + "AND task.equipmentRecord.hospital.id = :hospitalId "
            + "AND (:status IS NULL OR task.status = :status) "
            + "AND (:equipmentId IS NULL OR task.equipmentId = :equipmentId) "
            + "ORDER BY task.deadline ASC, task.id ASC")
    List<MaintenanceTask> findByHospitalIdWithFilters(
            @Param("hospitalId") Long hospitalId,
            @Param("status") MaintenanceStatus status,
            @Param("equipmentId") String equipmentId,
            Pageable pageable);

    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.id = :id AND task.hospitalId = :hospitalId "
            + "AND task.equipmentRecord.hospital.id = :hospitalId")
    Optional<MaintenanceTask> findByIdAndHospitalId(
            @Param("id") Long id,
            @Param("hospitalId") Long hospitalId);

    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.id = :id AND task.assignedTechnician = :assignedTechnician "
            + "AND task.equipmentRecord.hospital.id = task.hospitalId")
    Optional<MaintenanceTask> findByIdAndAssignedTechnician(
            @Param("id") Long id,
            @Param("assignedTechnician") String assignedTechnician);

    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.assignedTechnician = :assignedTechnician "
            + "AND task.equipmentRecord.hospital.id = task.hospitalId "
            + "AND (:status IS NULL OR task.status = :status) "
            + "AND (:equipmentId IS NULL OR task.equipmentId = :equipmentId) "
            + "ORDER BY task.deadline ASC, task.id ASC")
    List<MaintenanceTask> findByAssignedTechnicianWithFilters(
            @Param("assignedTechnician") String assignedTechnician,
            @Param("status") MaintenanceStatus status,
            @Param("equipmentId") String equipmentId,
            Pageable pageable);

    // Serialize updates to one assigned task so completion cannot create duplicate recurrences.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.id = :id AND task.assignedTechnician = :assignedTechnician "
            + "AND task.equipmentRecord.hospital.id = task.hospitalId")
    Optional<MaintenanceTask> findByIdAndAssignedTechnicianForUpdate(
            @Param("id") Long id,
            @Param("assignedTechnician") String assignedTechnician);

    // Serialize hospital deletion with technician completion of the same task.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.id = :id AND task.hospitalId = :hospitalId "
            + "AND task.equipmentRecord.hospital.id = :hospitalId")
    Optional<MaintenanceTask> findByIdAndHospitalIdForUpdate(
            @Param("id") Long id,
            @Param("hospitalId") Long hospitalId);

    // Equipment history remains hospital-scoped so it cannot leak another hospital's records.
    @Query("SELECT task FROM MaintenanceTask task "
            + "WHERE task.equipmentRecord.id = :equipmentId "
            + "AND task.hospitalId = :hospitalId "
            + "AND task.equipmentRecord.hospital.id = :hospitalId")
    List<MaintenanceTask> findByEquipmentRecord_IdAndHospitalId(
            @Param("equipmentId") Long equipmentId,
            @Param("hospitalId") Long hospitalId);

    // Analytics aggregation queries
    @Query("SELECT COUNT(t) FROM MaintenanceTask t WHERE t.hospitalId = :hospitalId AND t.status = :status")
    long countByHospitalIdAndStatus(@Param("hospitalId") Long hospitalId, @Param("status") MaintenanceStatus status);

    @Query("SELECT t FROM MaintenanceTask t WHERE t.hospitalId = :hospitalId AND t.status = :status AND t.completedAt IS NOT NULL AND t.deadline IS NOT NULL")
    List<MaintenanceTask> findCompletedTasksWithTimestamps(@Param("hospitalId") Long hospitalId, @Param("status") MaintenanceStatus status);

    @Query("SELECT AVG(t.hoursWorked) FROM MaintenanceTask t WHERE t.hospitalId = :hospitalId AND t.status = :status AND t.hoursWorked IS NOT NULL")
    Double averageHoursWorkedByHospitalIdAndStatus(@Param("hospitalId") Long hospitalId, @Param("status") MaintenanceStatus status);

    @Query("SELECT COUNT(t) FROM MaintenanceTask t WHERE t.hospitalId = :hospitalId AND t.status != :status AND t.priority = :priority")
    long countByHospitalIdAndStatusNotAndPriority(@Param("hospitalId") Long hospitalId, @Param("status") MaintenanceStatus status, @Param("priority") String priority);
}
