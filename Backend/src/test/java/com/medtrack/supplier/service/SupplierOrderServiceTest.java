package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SupplierOrderServiceTest {

        @Mock
        private EquipmentOrderRepository orderRepository;

        @InjectMocks
        private SupplierOrderService supplierOrderService;

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
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));
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
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "SHIPPED");

                assertNotNull(result);
                assertEquals("SHIPPED", result.getStatus());
                verify(orderRepository).save(order);
        }

        @Test
        void updateOrderStatus_ShippedToDelivered_Success() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("SHIPPED").build();
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));
                when(orderRepository.save(any(EquipmentOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                EquipmentOrder result = supplierOrderService.updateOrderStatus(1L, "DELIVERED");

                assertNotNull(result);
                assertEquals("DELIVERED", result.getStatus());
                verify(orderRepository).save(order);
        }

        @Test
        void updateOrderStatus_InvalidTransition_ThrowsInvalidStatusTransitionException() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("PENDING").build();
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));

                assertThrows(InvalidStatusTransitionException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "SHIPPED"));
        }

        @Test
        void updateOrderStatus_SameStateTransition_ThrowsInvalidStatusTransitionException() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.of(order));

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
                when(orderRepository.findById(1L)).thenReturn(java.util.Optional.empty());

                assertThrows(ResourceNotFoundException.class,
                                () -> supplierOrderService.updateOrderStatus(1L, "CONFIRMED"));
        }
}
