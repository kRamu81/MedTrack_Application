package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupplierOrderServiceTest {

        @Mock
        private EquipmentOrderRepository orderRepository;

        @Mock
        private ShipmentTrackingRepository shipmentTrackingRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private KafkaTemplate<String, Object> kafkaTemplate;

        private SupplierOrderService supplierOrderService;

        @BeforeEach
        void setUp() {
                supplierOrderService = new SupplierOrderService(orderRepository, shipmentTrackingRepository,
                                userRepository);
                ReflectionTestUtils.setField(supplierOrderService, "kafkaTemplate", kafkaTemplate);
                ReflectionTestUtils.setField(supplierOrderService, "orderEventsTopic", "order-events");
        }

        @Test
        void getSupplierOrders_ValidRequest_ReturnsPage() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();
                Page<EquipmentOrder> page = new PageImpl<>(Collections.singletonList(order));

                when(orderRepository.findSupplierOrders(
                                eq("PENDING"), eq("Processing"), eq(123L), eq("test"), any(Pageable.class)))
                                .thenReturn(page);

                Page<EquipmentOrder> result = supplierOrderService.getSupplierOrders(
                                0, 10, "orderDate", "desc", "PENDING", "Processing", 123L, "test");

                assertNotNull(result);
                assertEquals(1, result.getTotalElements());
                verify(orderRepository).findSupplierOrders(
                                eq("PENDING"), eq("Processing"), eq(123L), eq("test"), any(Pageable.class));
        }

        @Test
        void getSupplierOrders_InvalidPage_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class, () -> supplierOrderService.getSupplierOrders(
                                -1, 10, "orderDate", "desc", null, null, null, null));
        }

        @Test
        void getSupplierOrders_InvalidSize_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class, () -> supplierOrderService.getSupplierOrders(
                                0, 0, "orderDate", "desc", null, null, null, null));
        }

        @Test
        void getSupplierOrders_InvalidOrderStatus_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class, () -> supplierOrderService.getSupplierOrders(
                                0, 10, "orderDate", "desc", "INVALID_STATUS", null, null, null));
        }

        @Test
        void getSupplierOrders_InvalidShippingStatus_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class, () -> supplierOrderService.getSupplierOrders(
                                0, 10, "orderDate", "desc", null, "INVALID_SHIPPING", null, null));
        }

        @Test
        void getSupplierOrders_InvalidSupplierId_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class, () -> supplierOrderService.getSupplierOrders(
                                0, 10, "orderDate", "desc", null, null, -5L, null));
        }

        @Test
        void updateOrderStatus_PendingToConfirmed_Success() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("PENDING").build();
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "CONFIRMED");

                assertNotNull(result);
                assertEquals("CONFIRMED", result.getStatus());
                assertNotNull(result.getUpdatedAt());
                verify(orderRepository).save(order);
        }

        @Test
        void updateOrderStatus_ConfirmedToShipped_Success() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();
                ShipmentTracking shipment = ShipmentTracking.builder()
                                .orderId(1L)
                                .supplierId(1L)
                                .shipmentTrackingNumber("TRK-EXISTING")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(2))
                                .build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.of(shipment));
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(kafkaTemplate.send(anyString(), anyString(), any()))
                                .thenReturn(mock(CompletableFuture.class));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "SHIPPED");

                assertNotNull(result);
                assertEquals("SHIPPED", result.getStatus());
                assertEquals("TRK-EXISTING", result.getTrackingNo());
                assertEquals("Shipped", result.getShippingStatus());
                assertNotNull(result.getDispatchedAt());
                verify(shipmentTrackingRepository).save(any(ShipmentTracking.class));
                verify(orderRepository).save(order);
                verify(kafkaTemplate).send(eq("order-events"), eq("1"), any());
        }

        @Test
        void updateOrderStatus_ConfirmedToShipped_GeneratesTrackingAndEstimatedDelivery() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.findByShipmentTrackingNumber(anyString())).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(kafkaTemplate.send(anyString(), anyString(), any()))
                                .thenReturn(mock(CompletableFuture.class));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "SHIPPED");

                assertNotNull(result);
                assertEquals("SHIPPED", result.getStatus());
                assertNotNull(result.getTrackingNo());
                assertTrue(result.getTrackingNo().startsWith("TRK-"));
                assertNotNull(result.getEstimatedDelivery());
                assertEquals("Shipped", result.getShippingStatus());
                assertNotNull(result.getDispatchedAt());

                verify(shipmentTrackingRepository).save(any(ShipmentTracking.class));
                verify(orderRepository).save(order);
                verify(kafkaTemplate).send(eq("order-events"), eq("1"), any());
        }

        @Test
        void updateOrderStatus_ShippedToDelivered_Success() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("SHIPPED").build();
                ShipmentTracking shipment = ShipmentTracking.builder()
                                .orderId(1L)
                                .supplierId(1L)
                                .shipmentTrackingNumber("TRK-EXISTING")
                                .build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.of(shipment));
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                when(kafkaTemplate.send(anyString(), anyString(), any()))
                                .thenReturn(mock(CompletableFuture.class));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "DELIVERED");

                assertNotNull(result);
                assertEquals("DELIVERED", result.getStatus());
                assertEquals("Delivered", result.getShippingStatus());
                assertNotNull(result.getDeliveredAt());
                assertNotNull(shipment.getActualDeliveryDate());

                verify(shipmentTrackingRepository).save(shipment);
                verify(orderRepository).save(order);
                verify(kafkaTemplate).send(eq("order-events"), eq("1"), any());
        }

        @Test
        void updateOrderStatus_InvalidTransition_ThrowsInvalidStatusTransitionException() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("PENDING").build();
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

                assertThrows(InvalidStatusTransitionException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "SHIPPED"));
        }

        @Test
        void updateOrderStatus_SameStateTransition_ThrowsInvalidStatusTransitionException() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

                assertThrows(InvalidStatusTransitionException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "CONFIRMED"));
        }

        @Test
        void updateOrderStatus_UnknownStatus_ThrowsIllegalArgumentException() {
                assertThrows(IllegalArgumentException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "UNKNOWN"));
        }

        @Test
        void updateOrderStatus_OrderNotFound_ThrowsResourceNotFoundException() {
                when(orderRepository.findById(1L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "CONFIRMED"));
        }
}
