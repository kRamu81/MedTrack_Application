package com.medtrack.supplier.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.service.SupplierOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supplier/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Supplier Orders", description = "Endpoints for suppliers to query and retrieve localized equipment purchase orders.")
public class SupplierController {

    private final SupplierOrderService supplierOrderService;

    @GetMapping
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
}
