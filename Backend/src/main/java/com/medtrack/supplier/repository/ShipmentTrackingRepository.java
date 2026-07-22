package com.medtrack.supplier.repository;

import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, Long> {
    List<ShipmentTracking> findByShipmentStatus(ShipmentStatus status);

    Optional<ShipmentTracking> findByShipmentTrackingNumber(String shipmentTrackingNumber);

    Optional<ShipmentTracking> findByOrderId(Long orderId);

    List<ShipmentTracking> findBySupplierId(Long supplierId);

    List<ShipmentTracking> findByEstimatedDeliveryDateBefore(LocalDateTime dateTime);

    // Phase 7: Delay detection - find active (non-delivered) shipments not yet
    // flagged as delayed
    List<ShipmentTracking> findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus status);

    // Phase 7: Performance scoring - delivered shipments by supplier
    List<ShipmentTracking> findBySupplierIdAndShipmentStatus(Long supplierId, ShipmentStatus status);

    // Phase 7: Performance scoring - counts
    long countBySupplierId(Long supplierId);

    long countBySupplierIdAndDelayDetectedTrue(Long supplierId);
}
