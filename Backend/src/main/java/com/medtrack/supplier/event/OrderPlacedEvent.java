package com.medtrack.supplier.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent {
    private String orderCode;
    private String equipmentId;
    private String equipmentName;
    private Integer quantity;
    private BigDecimal unitCost;
    private String hospital;
    private String createdBy;
    private String notes;
    private String price;
}
