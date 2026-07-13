package com.medtrack.supplier.service;

import com.medtrack.exception.DuplicateTrackingNumberException;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentTrackingService {

    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final EquipmentOrderRepository orderRepository;

    @Transactional
    public ShipmentTrackingResponse createShipment(CreateShipmentRequest request) {
        // 1. Verify associated order exists
        EquipmentOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // 2. Prevent duplicate shipment creation for same order
        shipmentTrackingRepository.findByOrderId(request.getOrderId()).ifPresent(s -> {
            throw new IllegalArgumentException("Shipment tracking already exists for Order ID: " + request.getOrderId());
        });

        // 3. Ensure tracking number uniqueness
        shipmentTrackingRepository.findByShipmentTrackingNumber(request.getShipmentTrackingNumber()).ifPresent(s -> {
            throw new DuplicateTrackingNumberException("Tracking number already in use: " + request.getShipmentTrackingNumber());
        });

        // 4. Create and persist ShipmentTracking
        ShipmentTracking shipment = ShipmentTracking.builder()
                .orderId(request.getOrderId())
                .shipmentTrackingNumber(request.getShipmentTrackingNumber())
                .estimatedDeliveryDate(request.getEstimatedDeliveryDate())
                .shipmentStatus(ShipmentStatus.PENDING)
                .supplierId(request.getSupplierId())
                .createdAt(LocalDateTime.now())
                .build();

        ShipmentTracking savedShipment = shipmentTrackingRepository.save(shipment);

        // 5. Update order details
        order.setTrackingNo(request.getShipmentTrackingNumber());
        order.setCarrier(request.getCarrier());
        order.setStatus("CONFIRMED");
        order.setShippingStatus("Processing");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return mapToResponse(savedShipment);
    }

    @Transactional
    public ShipmentTrackingResponse updateShipmentStatus(Long id, UpdateShipmentStatusRequest request) {
        // 1. Retrieve the tracking record
        ShipmentTracking shipment = shipmentTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found with ID: " + id));

        // 2. Map and validate status transition
        ShipmentStatus newStatus;
        try {
            newStatus = ShipmentStatus.valueOf(request.getShipmentStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid shipment status value: " + request.getShipmentStatus());
        }

        ShipmentStatus currentStatus = shipment.getShipmentStatus();
        if (newStatus.ordinal() < currentStatus.ordinal()) {
            throw new InvalidStatusTransitionException(
                    "Cannot revert status from " + currentStatus + " to " + newStatus);
        }

        // 3. Update shipment record
        shipment.setShipmentStatus(newStatus);
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setActualDeliveryDate(LocalDateTime.now());
        }
        shipment.setUpdatedAt(LocalDateTime.now());
        ShipmentTracking updatedShipment = shipmentTrackingRepository.save(shipment);

        // 4. Update associated order
        EquipmentOrder order = orderRepository.findById(shipment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + shipment.getOrderId()));

        if (newStatus == ShipmentStatus.CONFIRMED) {
            order.setStatus("CONFIRMED");
            order.setShippingStatus("Processing");
        } else if (newStatus == ShipmentStatus.SHIPPED) {
            order.setStatus("IN_TRANSIT");
            order.setShippingStatus("Shipped");
            order.setDispatchedAt(LocalDateTime.now());
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            order.setStatus("DELIVERED");
            order.setShippingStatus("Delivered");
            order.setDeliveredAt(LocalDateTime.now());
        }

        if (request.getSupplierNotes() != null) {
            order.setSupplierNotes(request.getSupplierNotes());
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return mapToResponse(updatedShipment);
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentById(Long id) {
        ShipmentTracking shipment = shipmentTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found with ID: " + id));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentByTrackingNumber(String trackingNumber) {
        ShipmentTracking shipment = shipmentTrackingRepository.findByShipmentTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found for tracking number: " + trackingNumber));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentByOrderId(Long orderId) {
        ShipmentTracking shipment = shipmentTrackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found for Order ID: " + orderId));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentTrackingResponse> getShipmentsBySupplier(Long supplierId) {
        return shipmentTrackingRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ShipmentTrackingResponse mapToResponse(ShipmentTracking shipment) {
        return ShipmentTrackingResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                .actualDeliveryDate(shipment.getActualDeliveryDate())
                .shipmentStatus(shipment.getShipmentStatus().name())
                .supplierId(shipment.getSupplierId())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
