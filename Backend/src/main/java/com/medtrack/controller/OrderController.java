package com.medtrack.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<EquipmentOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentOrder> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<EquipmentOrder> placeOrder(@RequestBody EquipmentOrder order) {
        EquipmentOrder createdOrder = orderService.placeOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<EquipmentOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {

        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, notes));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}