package com.medtrack.repository;

import com.medtrack.model.EquipmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentOrderRepository extends JpaRepository<EquipmentOrder, Long> {
    Optional<EquipmentOrder> findByOrderCode(String orderCode);
    List<EquipmentOrder> findByStatus(String status);
    List<EquipmentOrder> findByEquipmentId(String equipmentId);
    List<EquipmentOrder> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
