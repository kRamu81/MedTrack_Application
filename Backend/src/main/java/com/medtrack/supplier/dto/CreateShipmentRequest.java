package com.medtrack.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShipmentRequest {

    @NotNull(message = "Order ID cannot be null")
    private Long orderId;

    @NotBlank(message = "Shipment tracking number cannot be blank")
    private String shipmentTrackingNumber;

    @NotBlank(message = "Carrier cannot be blank")
    private String carrier;

    private LocalDateTime estimatedDeliveryDate;

    @NotNull(message = "Supplier ID cannot be null")
    private Long supplierId;
}
