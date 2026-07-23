package com.medtrack.supplier.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.dto.SupplierPerformanceResponse;
import com.medtrack.supplier.service.SupplierOrderService;
import com.medtrack.supplier.service.SupplierPerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Supplier Orders", description = "Endpoints for suppliers to query and retrieve localized equipment purchase orders.")
public class SupplierController {

    private final SupplierOrderService supplierOrderService;
    private final SupplierPerformanceService supplierPerformanceService;

    @GetMapping("/orders")
    @Operation(summary = "Get paginated, filtered supplier orders", description = "Allows suppliers to search and filter through synchronized equipment purchase orders.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved orders", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "204", description = "No orders found matching the filter criteria"),
            @ApiResponse(responseCode = "400", description = "Invalid request arguments or filter properties")
    })
    public ResponseEntity<Page<EquipmentOrder>> getSupplierOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String shippingStatus,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String search) {

        Page<EquipmentOrder> orders = supplierOrderService.getSupplierOrders(
                page, size, sortBy, sortDir, status, shippingStatus, supplierId, search);

        if (orders.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }

    @PutMapping("/order/update/{orderId}")
    @PreAuthorize("hasRole('SUPPLIER')")
    @Operation(summary = "Update supplier order status", description = "Allows suppliers to update order status confirming transition validation rules.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully updated order status", content = @Content(schema = @Schema(implementation = EquipmentOrder.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request, status transition, or malformed request parameters"),
            @ApiResponse(responseCode = "404", description = "Supplier order not found")
    })
    public ResponseEntity<EquipmentOrder> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String newStatus) {

        EquipmentOrder updatedOrder = supplierOrderService.updateOrderStatus(orderId, newStatus);
        return ResponseEntity.ok(updatedOrder);
    }

    // -----------------------------------------------------------------------
    // Phase 7 – Supplier Performance Scoring
    // -----------------------------------------------------------------------

    @GetMapping("/suppliers/{supplierId}/performance")
    @Operation(summary = "Get supplier performance score", description = "Returns on-time delivery rate and overall performance score for the given supplier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Performance metrics returned successfully", content = @Content(schema = @Schema(implementation = SupplierPerformanceResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid supplier ID")
    })
    public ResponseEntity<SupplierPerformanceResponse> getSupplierPerformance(
            @PathVariable Long supplierId) {
        SupplierPerformanceResponse response = supplierPerformanceService.getPerformance(supplierId);
        return ResponseEntity.ok(response);
    }
}
