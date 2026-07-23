package com.medtrack.supplier.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Event published when an order status changes to SHIPPED.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderShippedEvent {
    private Long orderId;
    private String shipmentTrackingNumber;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime shippedAt;
    private Long supplierId;
}
