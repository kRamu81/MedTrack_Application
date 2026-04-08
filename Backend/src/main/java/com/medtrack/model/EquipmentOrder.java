package com.medtrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * EquipmentOrder Entity - Matches frontend RequestEquipmentPage.jsx, OrdersList.jsx, OrderStatus.jsx
 * API: GET    /api/orders       - List all orders
 * API: GET    /api/orders/{id}  - Get order by ID
 * API: POST   /api/orders       - Place new order
 * API: PUT    /api/orders/{id}  - Update order status (Supplier)
 * API: DELETE /api/orders/{id}  - Cancel/Delete order
 *
 * Status values (matches frontend): "PENDING", "CONFIRMED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"
 */
@Entity
@Table(name = "equipment_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Order code like "ORD-5502" */
    @Column(unique = true)
    private String orderCode;

    /** Equipment being ordered */
    private String equipmentId;
    private String equipmentName;

    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Status: "PENDING", "CONFIRMED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"
     * Matches OrderStatus.jsx steps
     */
    @Builder.Default
    private String status = "PENDING";

    /** Who placed this order (hospital admin name) */
    private String createdBy;

    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    private LocalDateTime updatedAt;

    /** Supplier notes on the order */
    @Column(columnDefinition = "TEXT")
    private String supplierNotes;
}
