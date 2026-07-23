package com.medtrack.supplier.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Event published when an order status changes to DELIVERED.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveredEvent {
    private Long orderId;
    private String shipmentTrackingNumber;
    private LocalDateTime actualDeliveryDate;
    private Long supplierId;
}
