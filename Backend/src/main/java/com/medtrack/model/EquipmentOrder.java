package com.medtrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * EquipmentOrder Entity
 * 
 * <p>Represents a procurement or demand order placed by a hospital for medical equipment,
 * fulfilled and managed by suppliers under the <strong>Supplier Operations Service (FR-04)</strong>.</p>
 * 
 * <p>This entity integrates directly with the React frontend pages:
 * <ul>
 *   <li>{@code RequestEquipmentPage.jsx} (Order Placement by Hospital Admins)</li>
 *   <li>{@code OrdersList.jsx} (Order Management by Suppliers)</li>
 *   <li>{@code OrderStatus.jsx} (Real-time Status Tracking by Hospital Admins and Suppliers)</li>
 * </ul>
 * </p>
 * 
 * <p><strong>Security / Role Restrictions (configured in SecurityConfig):</strong>
 * <ul>
 *   <li>{@code GET /api/orders/**} - Accessible to any authenticated user (Hospital, Technician, Supplier).</li>
 *   <li>{@code POST /api/orders/**} - Restricted to users with the {@code ROLE_HOSPITAL} authority.</li>
 *   <li>{@code PUT /api/orders/{id}/status} - Restricted to users with the {@code ROLE_SUPPLIER} authority.</li>
 *   <li>{@code DELETE /api/orders/**} - Restricted to users with the {@code ROLE_HOSPITAL} authority.</li>
 * </ul>
 * </p>
 * 
 * @see com.medtrack.controller.OrderController
 * @see com.medtrack.service.OrderService
 * @see com.medtrack.repository.EquipmentOrderRepository
 */
@Entity
@Table(
    name = "equipment_orders",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "orderCode", name = "uk_order_code")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentOrder {

    /**
     * Unique identifier for the order record, auto-incremented by the database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique human-readable code assigned to the order for tracking purposes (e.g., "ORD-5502").
     */
    @Column(nullable = false, unique = true, length = 50)
    private String orderCode;

    /**
     * The unique identifier of the medical equipment product catalog entry being ordered.
     */
    @Column(nullable = false, length = 100)
    private String equipmentId;

    /**
     * Cached name of the equipment at the time of the order to prevent data mismatch 
     * if the catalog product name changes in the future.
     */
    @Column(nullable = false, length = 255)
    private String equipmentName;

    /**
     * Quantity of units requested for the equipment order. Must be 1 or greater.
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Delivery, specifications, or urgency notes provided by the hospital administrator when placing the order.
     */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Internal status used for workflow transitions.
     * Accepted values: "PENDING", "CONFIRMED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"
     */
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "PENDING";

    /**
     * Shipping status presented and updated by the Supplier on the frontend.
     * Accepted values: "Processing", "Shipped", "Delivered", "Cancelled"
     */
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String shippingStatus = "Processing";

    /**
     * The name or branch of the hospital placing this order (e.g., "City General Hospital").
     * Displayed on the Supplier's orders list screen.
     */
    @Column(nullable = false, length = 255)
    private String hospital;

    /**
     * Audit trail field indicating the username or email of the hospital admin who created the order.
     */
    @Column(nullable = false, length = 255)
    private String createdBy;

    /**
     * Order transaction price details represented as a formatted currency string (e.g., "₹2,50,000").
     */
    @Column(length = 50)
    private String price;

    /**
     * Estimated delivery schedule or window promised by the supplier (e.g., "3-5 business days").
     */
    @Column(length = 100)
    private String estimatedDelivery;

    /**
     * Shipment carrier tracking number provided by the supplier upon dispatching the items.
     */
    @Column(length = 100)
    private String trackingNo;

    /**
     * The logistics carrier name (e.g., FedEx, DHL, Blue Dart).
     */
    @Column(length = 100)
    private String carrier;

    /**
     * The timestamp when the order was dispatched/shipped.
     */
    @Column
    private LocalDateTime dispatchedAt;

    /**
     * The timestamp when the order was delivered to the hospital.
     */
    @Column
    private LocalDateTime deliveredAt;

    /**
     * Timestamp indicating when the order was originally placed. Defaults to the system date and time.
     */
    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    /**
     * Timestamp indicating when the order details or statuses were last updated.
     */
    @Column
    private LocalDateTime updatedAt;

    /**
     * Operational notes or audit explanations submitted by the supplier when modifying the status of an order.
     */
    @Column(columnDefinition = "TEXT")
    private String supplierNotes;
}