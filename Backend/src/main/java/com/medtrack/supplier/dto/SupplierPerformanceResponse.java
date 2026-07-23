package com.medtrack.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO returned by the supplier performance endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierPerformanceResponse {
    private Long supplierId;
    private long totalShipments;
    private long deliveredShipments;
    private long delayedShipments;
    private long onTimeShipments;
    private double onTimeDeliveryRate;
    private double performanceScore;
}
