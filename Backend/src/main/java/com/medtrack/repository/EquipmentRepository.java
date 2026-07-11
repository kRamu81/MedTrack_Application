package com.medtrack.repository;

import com.medtrack.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByEquipmentCode(String equipmentCode);

    //add tenant-specific queries
    List<Equipment> findByHospitalId(Long hospitalId);
    Optional<Equipment> findByIdAndHospitalId(Long id, Long hospitalId);
}
