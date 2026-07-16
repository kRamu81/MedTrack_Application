package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
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
                eq("PENDING"), eq("Processing"), eq(123L), eq("test"), any(Pageable.class))).thenReturn(page);

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
}
