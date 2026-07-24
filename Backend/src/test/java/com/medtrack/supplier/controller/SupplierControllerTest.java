package com.medtrack.supplier.controller;

import com.medtrack.exception.GlobalExceptionHandler;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.dto.SupplierPerformanceResponse;
import com.medtrack.supplier.security.SupplierAccessGuard;
import com.medtrack.supplier.service.SupplierOrderService;
import com.medtrack.supplier.service.SupplierPerformanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class SupplierControllerTest {

        private MockMvc mockMvc;

        @Mock
        private SupplierOrderService supplierOrderService;

        @Mock
        private SupplierPerformanceService supplierPerformanceService;

        @Mock
        private SupplierAccessGuard supplierAccessGuard;

        private SupplierController supplierController;

        @BeforeEach
        void setUp() {
                supplierController = new SupplierController(supplierOrderService, supplierPerformanceService,
                                supplierAccessGuard);
                mockMvc = MockMvcBuilders.standaloneSetup(supplierController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        @Test
        void getSupplierOrders_Success() throws Exception {
                // The caller is a supplier (not a HOSPITAL admin) whose own resolved ID is 100.
                // Even though the request also carries a supplierId param, the controller uses
                // the resolved caller identity rather than trusting the client-supplied value.
                when(supplierAccessGuard.resolveCallerId(any())).thenReturn(100L);

                EquipmentOrder order = EquipmentOrder.builder()
                                .id(1L)
                                .orderCode("ORD-101")
                                .status("PENDING")
                                .shippingStatus("Processing")
                                .equipmentName("Ventilator")
                                .hospital("City Hospital")
                                .build();

                Page<EquipmentOrder> page = new PageImpl<>(Collections.singletonList(order), PageRequest.of(0, 10), 1);

                when(supplierOrderService.getSupplierOrders(
                                eq(0), eq(10), eq("orderDate"), eq("desc"),
                                eq("PENDING"), eq("Processing"), eq(100L), eq("Ventilator"))).thenReturn(page);

                mockMvc.perform(get("/api/supplier/orders")
                                .param("page", "0")
                                .param("size", "10")
                                .param("sortBy", "orderDate")
                                .param("sortDir", "desc")
                                .param("status", "PENDING")
                                .param("shippingStatus", "Processing")
                                .param("supplierId", "100")
                                .param("search", "Ventilator")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].id").value(1))
                                .andExpect(jsonPath("$.content[0].orderCode").value("ORD-101"))
                                .andExpect(jsonPath("$.content[0].equipmentName").value("Ventilator"));
        }

        @Test
        void getSupplierOrders_SupplierCannotViewAnotherSuppliersOrders() throws Exception {
                // The caller's own ID is 100, but they ask for supplierId=999 in the query
                // string. The controller must ignore that client-supplied value.
                when(supplierAccessGuard.resolveCallerId(any())).thenReturn(100L);

                Page<EquipmentOrder> emptyPage = new PageImpl<>(Collections.emptyList());
                when(supplierOrderService.getSupplierOrders(
                                eq(0), eq(10), eq("orderDate"), eq("desc"),
                                eq(null), eq(null), eq(100L), eq(null))).thenReturn(emptyPage);

                mockMvc.perform(get("/api/supplier/orders").param("supplierId", "999"))
                                .andExpect(status().isNoContent());
        }

        @Test
        void getSupplierOrders_HospitalAdminCanFilterByAnySupplier() throws Exception {
                when(supplierAccessGuard.isHospitalAdmin(any())).thenReturn(true);

                Page<EquipmentOrder> emptyPage = new PageImpl<>(Collections.emptyList());
                when(supplierOrderService.getSupplierOrders(
                                eq(0), eq(10), eq("orderDate"), eq("desc"),
                                eq(null), eq(null), eq(999L), eq(null))).thenReturn(emptyPage);

                mockMvc.perform(get("/api/supplier/orders").param("supplierId", "999"))
                                .andExpect(status().isNoContent());
        }

        @Test
        void getSupplierOrders_InvalidParams_Returns400() throws Exception {
                // Mockito's default answer for an unstubbed Long-returning method is 0L, not
                // null, so that's what resolveCallerId() yields here since it isn't stubbed.
                when(supplierOrderService.getSupplierOrders(
                                eq(-1), eq(10), eq("orderDate"), eq("desc"),
                                eq(null), eq(null), eq(0L), eq(null)))
                                .thenThrow(new IllegalArgumentException("Page index must not be less than zero"));

                mockMvc.perform(get("/api/supplier/orders")
                                .param("page", "-1"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Page index must not be less than zero"));
        }

        @Test
        void updateOrderStatus_Success() throws Exception {
                EquipmentOrder updatedOrder = EquipmentOrder.builder()
                                .id(1L)
                                .status("CONFIRMED")
                                .build();

                when(supplierOrderService.updateOrderStatus(eq(1L), eq("CONFIRMED"), any())).thenReturn(updatedOrder);

                mockMvc.perform(put("/api/supplier/order/update/1")
                                .param("newStatus", "CONFIRMED")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("CONFIRMED"));
        }

        @Test
        void updateOrderStatus_InvalidTransition_Returns400() throws Exception {
                when(supplierOrderService.updateOrderStatus(eq(1L), eq("SHIPPED"), any()))
                                .thenThrow(new com.medtrack.exception.InvalidStatusTransitionException(
                                                "Invalid status transition"));

                mockMvc.perform(put("/api/supplier/order/update/1")
                                .param("newStatus", "SHIPPED")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Invalid status transition"));
        }

        @Test
        void updateOrderStatus_NotFound_Returns404() throws Exception {
                when(supplierOrderService.updateOrderStatus(eq(99L), eq("CONFIRMED"), any()))
                                .thenThrow(new com.medtrack.exception.ResourceNotFoundException(
                                                "Order not found with id: 99"));

                mockMvc.perform(put("/api/supplier/order/update/99")
                                .param("newStatus", "CONFIRMED")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.message").value("Order not found with id: 99"));
        }

        @Test
        void updateOrderStatus_DeniedForOtherSupplier_Returns403() throws Exception {
                when(supplierOrderService.updateOrderStatus(eq(1L), eq("SHIPPED"), any()))
                                .thenThrow(new AccessDeniedException("Not authorized"));

                mockMvc.perform(put("/api/supplier/order/update/1")
                                .param("newStatus", "SHIPPED")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isForbidden());
        }

        // -----------------------------------------------------------------------
        // Phase 7 – Supplier Performance
        // -----------------------------------------------------------------------

        @Test
        void getSupplierPerformance_Success() throws Exception {
                SupplierPerformanceResponse perfResponse = SupplierPerformanceResponse.builder()
                                .supplierId(10L)
                                .totalShipments(5L)
                                .deliveredShipments(4L)
                                .delayedShipments(1L)
                                .onTimeShipments(3L)
                                .onTimeDeliveryRate(75.0)
                                .performanceScore(80.0)
                                .build();

                when(supplierPerformanceService.getPerformance(10L)).thenReturn(perfResponse);

                mockMvc.perform(get("/api/supplier/suppliers/10/performance")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.supplierId").value(10))
                                .andExpect(jsonPath("$.totalShipments").value(5))
                                .andExpect(jsonPath("$.deliveredShipments").value(4))
                                .andExpect(jsonPath("$.delayedShipments").value(1))
                                .andExpect(jsonPath("$.onTimeShipments").value(3))
                                .andExpect(jsonPath("$.onTimeDeliveryRate").value(75.0))
                                .andExpect(jsonPath("$.performanceScore").value(80.0));
        }

        @Test
        void getSupplierPerformance_DeniedForOtherSupplier_Returns403() throws Exception {
                doThrow(new AccessDeniedException("Not authorized"))
                                .when(supplierAccessGuard).assertSelfOrHospitalAdmin(any(), eq(10L));

                mockMvc.perform(get("/api/supplier/suppliers/10/performance"))
                                .andExpect(status().isForbidden());
        }
}
