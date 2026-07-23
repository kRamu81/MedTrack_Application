package com.medtrack.supplier.service;

import com.medtrack.supplier.dto.SupplierPerformanceResponse;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupplierPerformanceServiceTest {

    @Mock
    private ShipmentTrackingRepository shipmentTrackingRepository;

    private SupplierPerformanceService service;

    @BeforeEach
    void setUp() {
        service = new SupplierPerformanceService(shipmentTrackingRepository);
        ReflectionTestUtils.setField(service, "onTimeWeight", 0.8);
        ReflectionTestUtils.setField(service, "delayPenaltyWeight", 20.0);
    }

    @Test
    void getPerformance_MixedShipments_CorrectMetrics() {
        Long supplierId = 10L;

        // 4 total, 2 delivered (1 on-time, 1 delayed), 1 delayed total
        ShipmentTracking onTime = ShipmentTracking.builder()
                .id(1L).supplierId(supplierId).shipmentStatus(ShipmentStatus.DELIVERED)
                .delayDetected(false).build();
        ShipmentTracking delayed = ShipmentTracking.builder()
                .id(2L).supplierId(supplierId).shipmentStatus(ShipmentStatus.DELIVERED)
                .delayDetected(true).build();

        when(shipmentTrackingRepository.countBySupplierId(supplierId)).thenReturn(4L);
        when(shipmentTrackingRepository.countBySupplierIdAndDelayDetectedTrue(supplierId)).thenReturn(1L);
        when(shipmentTrackingRepository.findBySupplierIdAndShipmentStatus(supplierId, ShipmentStatus.DELIVERED))
                .thenReturn(List.of(onTime, delayed));

        SupplierPerformanceResponse response = service.getPerformance(supplierId);

        assertNotNull(response);
        assertEquals(supplierId, response.getSupplierId());
        assertEquals(4L, response.getTotalShipments());
        assertEquals(2L, response.getDeliveredShipments());
        assertEquals(1L, response.getDelayedShipments());
        assertEquals(1L, response.getOnTimeShipments());

        // onTimeRate = 1/2 * 100 = 50.0
        assertEquals(50.0, response.getOnTimeDeliveryRate(), 0.001);

        // score = (50.0 * 0.8) + ((1 - 1/4) * 20.0) = 40.0 + 15.0 = 55.0
        assertEquals(55.0, response.getPerformanceScore(), 0.001);
    }

    @Test
    void getPerformance_AllOnTime_MaxOnTimeRate() {
        Long supplierId = 20L;

        ShipmentTracking s1 = ShipmentTracking.builder().id(1L).supplierId(supplierId)
                .shipmentStatus(ShipmentStatus.DELIVERED).delayDetected(false).build();
        ShipmentTracking s2 = ShipmentTracking.builder().id(2L).supplierId(supplierId)
                .shipmentStatus(ShipmentStatus.DELIVERED).delayDetected(false).build();

        when(shipmentTrackingRepository.countBySupplierId(supplierId)).thenReturn(2L);
        when(shipmentTrackingRepository.countBySupplierIdAndDelayDetectedTrue(supplierId)).thenReturn(0L);
        when(shipmentTrackingRepository.findBySupplierIdAndShipmentStatus(supplierId, ShipmentStatus.DELIVERED))
                .thenReturn(List.of(s1, s2));

        SupplierPerformanceResponse response = service.getPerformance(supplierId);

        assertEquals(100.0, response.getOnTimeDeliveryRate(), 0.001);
        // score = (100 * 0.8) + ((1 - 0) * 20) = 80 + 20 = 100
        assertEquals(100.0, response.getPerformanceScore(), 0.001);
        assertEquals(2L, response.getOnTimeShipments());
        assertEquals(0L, response.getDelayedShipments());
    }

    @Test
    void getPerformance_AllDelayed_ZeroOnTimeRate() {
        Long supplierId = 30L;

        ShipmentTracking d1 = ShipmentTracking.builder().id(1L).supplierId(supplierId)
                .shipmentStatus(ShipmentStatus.DELIVERED).delayDetected(true).build();
        ShipmentTracking d2 = ShipmentTracking.builder().id(2L).supplierId(supplierId)
                .shipmentStatus(ShipmentStatus.DELIVERED).delayDetected(true).build();

        when(shipmentTrackingRepository.countBySupplierId(supplierId)).thenReturn(2L);
        when(shipmentTrackingRepository.countBySupplierIdAndDelayDetectedTrue(supplierId)).thenReturn(2L);
        when(shipmentTrackingRepository.findBySupplierIdAndShipmentStatus(supplierId, ShipmentStatus.DELIVERED))
                .thenReturn(List.of(d1, d2));

        SupplierPerformanceResponse response = service.getPerformance(supplierId);

        assertEquals(0.0, response.getOnTimeDeliveryRate(), 0.001);
        assertEquals(0L, response.getOnTimeShipments());
        // score = (0 * 0.8) + ((1 - 2/2) * 20) = 0 + 0 = 0
        assertEquals(0.0, response.getPerformanceScore(), 0.001);
    }

    @Test
    void getPerformance_NoShipments_ReturnsZeroScore() {
        Long supplierId = 40L;

        when(shipmentTrackingRepository.countBySupplierId(supplierId)).thenReturn(0L);
        when(shipmentTrackingRepository.countBySupplierIdAndDelayDetectedTrue(supplierId)).thenReturn(0L);
        when(shipmentTrackingRepository.findBySupplierIdAndShipmentStatus(supplierId, ShipmentStatus.DELIVERED))
                .thenReturn(Collections.emptyList());

        SupplierPerformanceResponse response = service.getPerformance(supplierId);

        assertNotNull(response);
        assertEquals(0L, response.getTotalShipments());
        assertEquals(0L, response.getDeliveredShipments());
        assertEquals(0.0, response.getOnTimeDeliveryRate(), 0.001);
        // score = (0 * 0.8) + ((1 - 0) * 20) = 20
        assertEquals(20.0, response.getPerformanceScore(), 0.001);
    }
}
