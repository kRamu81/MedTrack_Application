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

    List<ShipmentTracking> findBySupplierId(Long supplierId);

    List<ShipmentTracking> findByEstimatedDeliveryDateBefore(LocalDateTime dateTime);
}
