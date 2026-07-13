package com.medtrack.supplier.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.exception.GlobalExceptionHandler;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.service.ShipmentTrackingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ShipmentTrackingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ShipmentTrackingService shipmentTrackingService;

    @InjectMocks
    private ShipmentTrackingController shipmentTrackingController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(shipmentTrackingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createShipment_Success() throws Exception {
        CreateShipmentRequest request = CreateShipmentRequest.builder()
                .orderId(1L)
                .shipmentTrackingNumber("TRK12345")
                .carrier("DHL")
                .estimatedDeliveryDate(LocalDateTime.now().plusDays(2))
                .supplierId(10L)
                .build();

        ShipmentTrackingResponse response = ShipmentTrackingResponse.builder()
                .id(100L)
                .orderId(1L)
                .shipmentTrackingNumber("TRK12345")
                .shipmentStatus("PENDING")
                .supplierId(10L)
                .build();

        when(shipmentTrackingService.createShipment(any(CreateShipmentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.shipmentTrackingNumber").value("TRK12345"))
                .andExpect(jsonPath("$.shipmentStatus").value("PENDING"));
    }

    @Test
    void createShipment_ValidationFailed_Returns400() throws Exception {
        CreateShipmentRequest invalidRequest = CreateShipmentRequest.builder()
                .orderId(null) // invalid
                .shipmentTrackingNumber("") // invalid
                .carrier("") // invalid
                .supplierId(null) // invalid
                .build();

        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.orderId").exists())
                .andExpect(jsonPath("$.errors.shipmentTrackingNumber").exists())
                .andExpect(jsonPath("$.errors.carrier").exists())
                .andExpect(jsonPath("$.errors.supplierId").exists());
    }

    @Test
    void updateShipmentStatus_Success() throws Exception {
        UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                .shipmentStatus("SHIPPED")
                .supplierNotes("En route")
                .build();

        ShipmentTrackingResponse response = ShipmentTrackingResponse.builder()
                .id(100L)
                .orderId(1L)
                .shipmentTrackingNumber("TRK12345")
                .shipmentStatus("SHIPPED")
                .build();

        when(shipmentTrackingService.updateShipmentStatus(eq(100L), any(UpdateShipmentStatusRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/shipments/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus").value("SHIPPED"));
    }

    @Test
    void updateShipmentStatus_InvalidTransition_Returns400() throws Exception {
        UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                .shipmentStatus("PENDING")
                .build();

        when(shipmentTrackingService.updateShipmentStatus(eq(100L), any(UpdateShipmentStatusRequest.class)))
                .thenThrow(new InvalidStatusTransitionException("Cannot revert status from SHIPPED to PENDING"));

        mockMvc.perform(put("/api/shipments/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot revert status from SHIPPED to PENDING"));
    }

    @Test
    void getShipmentById_NotFound_Returns404() throws Exception {
        when(shipmentTrackingService.getShipmentById(999L))
                .thenThrow(new ResourceNotFoundException("Shipment tracking not found with ID: 999"));

        mockMvc.perform(get("/api/shipments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Shipment tracking not found with ID: 999"));
    }

    @Test
    void getShipmentsBySupplier_Success() throws Exception {
        ShipmentTrackingResponse item = ShipmentTrackingResponse.builder()
                .id(100L)
                .supplierId(10L)
                .build();

        when(shipmentTrackingService.getShipmentsBySupplier(10L)).thenReturn(Collections.singletonList(item));

        mockMvc.perform(get("/api/shipments/supplier/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].supplierId").value(10));
    }
}
