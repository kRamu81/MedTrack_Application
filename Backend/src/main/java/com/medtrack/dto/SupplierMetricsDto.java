package com.medtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierMetricsDto {
    private long totalOrders;
    private long pendingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private double averageDeliveryDays;
    private double onTimeRate;
}
