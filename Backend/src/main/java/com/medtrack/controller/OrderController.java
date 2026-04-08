package com.medtrack.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<EquipmentOrder> placeOrder(@RequestBody EquipmentOrder order) {
        return ResponseEntity.ok(orderService.placeOrder(order));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<EquipmentOrder> updateStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, notes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
