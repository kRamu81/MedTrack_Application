package com.medtrack.repository;

import com.medtrack.model.Equipment;
import com.medtrack.model.EquipmentCategory;
import com.medtrack.model.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Optional<Equipment> findByEquipmentCode(String equipmentCode);

    // Tenant-specific queries
    List<Equipment> findByHospitalId(Long hospitalId);

    Optional<Equipment> findByIdAndHospitalId(Long id, Long hospitalId);

    // Warranty monitoring queries
    List<Equipment> findByHospitalIdAndWarrantyExpiryBefore(
            Long hospitalId,
            LocalDate date
    );

    List<Equipment> findByHospitalIdAndWarrantyExpiryBetween(
            Long hospitalId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Low stock inventory
    @Query("""
            SELECT e
            FROM Equipment e
            WHERE e.hospital.id = :hospitalId
            AND e.quantity <= e.minimumStock
            """)
    List<Equipment> findLowStockEquipment(@Param("hospitalId") Long hospitalId);

    // Analytics aggregation queries
    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.hospital.id = :hospitalId")
    long countByHospitalId(@Param("hospitalId") Long hospitalId);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.hospital.id = :hospitalId AND e.status = :status")
    long countByHospitalIdAndStatus(@Param("hospitalId") Long hospitalId, @Param("status") EquipmentStatus status);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.hospital.id = :hospitalId AND e.warrantyExpiry BETWEEN :start AND :end")
    long countByHospitalIdAndWarrantyExpiryBetween(@Param("hospitalId") Long hospitalId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e.name, e.category FROM Equipment e WHERE e.hospital.id = :hospitalId")
    List<Object[]> findNameAndCategoryByHospitalId(@Param("hospitalId") Long hospitalId);

    List<Equipment> findByHospitalIdAndDepartmentIgnoreCase(Long hospitalId, String department);
}