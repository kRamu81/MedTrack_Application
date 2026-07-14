package com.medtrack.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.dto.SupplierMetricsDto;
import com.medtrack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing equipment orders.
 * Provides endpoints to create, retrieve, update,
 * download purchase orders, and delete orders.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    /**
     * Retrieves all equipment orders.
     *
     * @return a list of equipment orders if available,
     *         or HTTP 204 No Content when no orders exist
     */
    @GetMapping
    public ResponseEntity<List<EquipmentOrder>> getAllOrders() {
        List<EquipmentOrder> orders = orderService.getAllOrders();

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }

    /**
     * Retrieves KPI scorecard metrics for suppliers (on-time rate, averages, counts).
     *
     * @return the calculated supplier metrics DTO
     */
    @GetMapping("/supplier/metrics")
    public ResponseEntity<SupplierMetricsDto> getSupplierMetrics() {
        return ResponseEntity.ok(orderService.getSupplierMetrics());
    }

    /**
     * Retrieves an equipment order by its unique identifier.
     *
     * @param id the order identifier
     * @return the requested equipment order
     */
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentOrder> getOrderById(@PathVariable Long id) {
        validateId(id);
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * Creates a new equipment order.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param order the equipment order to create
     * @return the newly created equipment order with HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<EquipmentOrder> placeOrder(@RequestBody EquipmentOrder order) {
        EquipmentOrder createdOrder = orderService.placeOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    /**
     * Downloads the purchase order as a PDF document.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param id the order identifier
     * @return a PDF file containing the purchase order
     */
    @GetMapping("/{id}/purchase-order.pdf")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<byte[]> downloadPurchaseOrder(@PathVariable Long id) {
        validateId(id);

        EquipmentOrder order = orderService.getOrderById(id);
        byte[] pdf = orderService.generatePurchaseOrderPdf(id);
        String orderCode = order.getOrderCode() == null ? String.valueOf(id) : order.getOrderCode();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=purchase-order-" + orderCode + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * Updates the status of an existing equipment order.
     * Accessible only to users with the SUPPLIER role.
     *
     * @param id the order identifier
     * @param status the updated order status
     * @param notes optional supplier notes related to the status update
     * @return the updated equipment order
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<EquipmentOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {

        validateId(id);
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, notes));
    }

    /**
     * Downloads the commercial invoice for the order as a PDF document.
     * Accessible to both HOSPITAL and SUPPLIER roles.
     *
     * @param id the order identifier
     * @return a PDF file containing the commercial invoice
     */
    @GetMapping("/{id}/invoice.pdf")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        EquipmentOrder order = orderService.getOrderById(id);
        byte[] pdf = orderService.generateInvoicePdf(id);
        String orderCode = order.getOrderCode() == null ? String.valueOf(id) : order.getOrderCode();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + orderCode + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * Emails the commercial invoice to the hospital admin who created the order.
     * Accessible only to the SUPPLIER role.
     *
     * @param id the order identifier
     * @return HTTP 200 OK when email is sent successfully
     */
    @PostMapping("/{id}/invoice/email")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Void> emailInvoice(@PathVariable Long id) {
        orderService.emailInvoice(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Deletes an equipment order by its identifier.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param id the order identifier
     * @return HTTP 204 No Content when the order is successfully deleted
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        validateId(id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Validates that a resource ID is a positive number.
     *
     * @param id the resource identifier
     * @throws IllegalArgumentException if the ID is less than or equal to zero
     */
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid resource ID.");
        }
    }
}