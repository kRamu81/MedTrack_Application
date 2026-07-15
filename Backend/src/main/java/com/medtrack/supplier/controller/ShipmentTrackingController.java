package com.medtrack.supplier.controller;

import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.service.ShipmentTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentTrackingController {

    private final ShipmentTrackingService shipmentTrackingService;

    @PostMapping
    public ResponseEntity<ShipmentTrackingResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        ShipmentTrackingResponse response = shipmentTrackingService.createShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ShipmentTrackingResponse> updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentById(@PathVariable Long id) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentByOrderId(@PathVariable Long orderId) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<ShipmentTrackingResponse>> getShipmentsBySupplier(@PathVariable Long supplierId) {
        List<ShipmentTrackingResponse> response = shipmentTrackingService.getShipmentsBySupplier(supplierId);
        return ResponseEntity.ok(response);
    }
}
