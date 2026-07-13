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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShipmentTrackingServiceTest {

    @Mock
    private ShipmentTrackingRepository shipmentTrackingRepository;

    @Mock
    private EquipmentOrderRepository orderRepository;

    @InjectMocks
    private ShipmentTrackingService shipmentTrackingService;

    @Test
    void createShipment_Success() {
        CreateShipmentRequest request = CreateShipmentRequest.builder()
                .orderId(1L)
                .shipmentTrackingNumber("TRK123456")
                .carrier("FedEx")
                .estimatedDeliveryDate(LocalDateTime.now().plusDays(3))
                .supplierId(10L)
                .build();

        EquipmentOrder order = EquipmentOrder.builder()
                .id(1L)
                .status("PENDING")
                .build();

        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(5L)
                .orderId(1L)
                .shipmentTrackingNumber("TRK123456")
                .shipmentStatus(ShipmentStatus.PENDING)
                .supplierId(10L)
                .createdAt(LocalDateTime.now())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
        when(shipmentTrackingRepository.findByShipmentTrackingNumber("TRK123456")).thenReturn(Optional.empty());
        when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);

        ShipmentTrackingResponse response = shipmentTrackingService.createShipment(request);

        assertNotNull(response);
        assertEquals(5L, response.getId());
        assertEquals("TRK123456", response.getShipmentTrackingNumber());
        assertEquals("PENDING", response.getShipmentStatus());
        assertEquals("CONFIRMED", order.getStatus());
        assertEquals("TRK123456", order.getTrackingNo());
        assertEquals("FedEx", order.getCarrier());

        verify(orderRepository).save(order);
        verify(shipmentTrackingRepository).save(any(ShipmentTracking.class));
    }

    @Test
    void createShipment_OrderNotFound_ThrowsException() {
        CreateShipmentRequest request = CreateShipmentRequest.builder()
                .orderId(1L)
                .shipmentTrackingNumber("TRK123456")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shipmentTrackingService.createShipment(request));
        verify(shipmentTrackingRepository, never()).save(any());
    }

    @Test
    void createShipment_DuplicateShipmentForOrder_ThrowsException() {
        CreateShipmentRequest request = CreateShipmentRequest.builder()
                .orderId(1L)
                .shipmentTrackingNumber("TRK123456")
                .build();

        EquipmentOrder order = EquipmentOrder.builder().id(1L).build();
        ShipmentTracking existingShipment = ShipmentTracking.builder().id(5L).orderId(1L).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.of(existingShipment));

        assertThrows(IllegalArgumentException.class, () -> shipmentTrackingService.createShipment(request));
        verify(shipmentTrackingRepository, never()).save(any());
    }

    @Test
    void createShipment_DuplicateTrackingNumber_ThrowsException() {
        CreateShipmentRequest request = CreateShipmentRequest.builder()
                .orderId(1L)
                .shipmentTrackingNumber("TRK123456")
                .build();

        EquipmentOrder order = EquipmentOrder.builder().id(1L).build();
        ShipmentTracking existingShipment = ShipmentTracking.builder().id(6L).shipmentTrackingNumber("TRK123456").build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
        when(shipmentTrackingRepository.findByShipmentTrackingNumber("TRK123456")).thenReturn(Optional.of(existingShipment));

        assertThrows(DuplicateTrackingNumberException.class, () -> shipmentTrackingService.createShipment(request));
        verify(shipmentTrackingRepository, never()).save(any());
    }

    @Test
    void updateShipmentStatus_ToShipped_Success() {
        UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                .shipmentStatus("SHIPPED")
                .supplierNotes("Handed to carrier")
                .build();

        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(5L)
                .orderId(1L)
                .shipmentStatus(ShipmentStatus.PENDING)
                .build();

        EquipmentOrder order = EquipmentOrder.builder()
                .id(1L)
                .status("CONFIRMED")
                .build();

        when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));
        when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

        assertNotNull(response);
        assertEquals("SHIPPED", response.getShipmentStatus());
        assertEquals("IN_TRANSIT", order.getStatus());
        assertEquals("Shipped", order.getShippingStatus());
        assertEquals("Handed to carrier", order.getSupplierNotes());
        assertNotNull(order.getDispatchedAt());

        verify(shipmentTrackingRepository).save(shipment);
        verify(orderRepository).save(order);
    }

    @Test
    void updateShipmentStatus_ToDelivered_Success() {
        UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                .shipmentStatus("DELIVERED")
                .build();

        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(5L)
                .orderId(1L)
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .build();

        EquipmentOrder order = EquipmentOrder.builder()
                .id(1L)
                .status("IN_TRANSIT")
                .build();

        when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));
        when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

        assertNotNull(response);
        assertEquals("DELIVERED", response.getShipmentStatus());
        assertEquals("DELIVERED", order.getStatus());
        assertEquals("Delivered", order.getShippingStatus());
        assertNotNull(order.getDeliveredAt());
        assertNotNull(shipment.getActualDeliveryDate());

        verify(shipmentTrackingRepository).save(shipment);
        verify(orderRepository).save(order);
    }

    @Test
    void updateShipmentStatus_InvalidTransition_ThrowsException() {
        UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                .shipmentStatus("PENDING") // Cannot transition back from SHIPPED to PENDING
                .build();

        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(5L)
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .build();

        when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

        assertThrows(InvalidStatusTransitionException.class, () -> shipmentTrackingService.updateShipmentStatus(5L, request));
        verify(shipmentTrackingRepository, never()).save(any());
    }

    @Test
    void getShipmentById_Success() {
        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(5L)
                .orderId(1L)
                .shipmentTrackingNumber("TRK123")
                .shipmentStatus(ShipmentStatus.PENDING)
                .build();

        when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

        ShipmentTrackingResponse response = shipmentTrackingService.getShipmentById(5L);

        assertNotNull(response);
        assertEquals(5L, response.getId());
        assertEquals("TRK123", response.getShipmentTrackingNumber());
    }
}
