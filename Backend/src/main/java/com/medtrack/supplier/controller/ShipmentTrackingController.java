package com.medtrack.supplier.controller;

import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.service.ShipmentTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentTrackingController {

    private final ShipmentTrackingService shipmentTrackingService;

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ShipmentTrackingResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request,
            Authentication authentication) {
        ShipmentTrackingResponse response = shipmentTrackingService.createShipment(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<ShipmentTrackingResponse> updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request,
            Authentication authentication) {
        ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(id, request, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentById(@PathVariable Long id,
            Authentication authentication) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentById(id, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentByTrackingNumber(@PathVariable String trackingNumber,
            Authentication authentication) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentByTrackingNumber(trackingNumber, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<ShipmentTrackingResponse> getShipmentByOrderId(@PathVariable Long orderId,
            Authentication authentication) {
        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentByOrderId(orderId, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'SUPPLIER')")
    public ResponseEntity<List<ShipmentTrackingResponse>> getShipmentsBySupplier(@PathVariable Long supplierId,
            Authentication authentication) {
        List<ShipmentTrackingResponse> response = shipmentTrackingService.getShipmentsBySupplier(supplierId, authentication);
        return ResponseEntity.ok(response);
    }
}
