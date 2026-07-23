package com.medtrack.supplier.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Event published when a shipment is detected as delayed (estimatedDeliveryDate
 * has passed
 * and the shipment has not yet been delivered). Published exactly once per
 * shipment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDelayedEvent {
    private Long shipmentId;
    private Long orderId;
    private Long supplierId;
    private String shipmentTrackingNumber;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime detectedAt;
}
