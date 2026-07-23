package com.medtrack.repository;

import com.medtrack.model.EquipmentOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT o FROM EquipmentOrder o WHERE " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:shippingStatus IS NULL OR o.shippingStatus = :shippingStatus) AND " +
            "(:supplierId IS NULL OR EXISTS (SELECT s FROM ShipmentTracking s WHERE s.orderId = o.id AND s.supplierId = :supplierId)) AND "
            +
            "(:search IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.equipmentName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<EquipmentOrder> findSupplierOrders(
            @Param("status") String status,
            @Param("shippingStatus") String shippingStatus,
            @Param("supplierId") Long supplierId,
            @Param("search") String search,
            Pageable pageable);
}
