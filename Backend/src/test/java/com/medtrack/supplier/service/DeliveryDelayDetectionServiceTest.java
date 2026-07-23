package com.medtrack.supplier.service;

import com.medtrack.supplier.event.ShipmentDelayedEvent;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DeliveryDelayDetectionServiceTest {

    @Mock
    private ShipmentTrackingRepository shipmentTrackingRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private DeliveryDelayDetectionService service;

    @BeforeEach
    void setUp() {
        service = new DeliveryDelayDetectionService(shipmentTrackingRepository);
        ReflectionTestUtils.setField(service, "kafkaTemplate", kafkaTemplate);
        ReflectionTestUtils.setField(service, "delayEventsTopic", "delay-events");
    }

    // -----------------------------------------------------------------------
    // detectDelays() – scheduler entry point
    // -----------------------------------------------------------------------

    @Test
    void detectDelays_DelayedShipment_SetsDelayFlagAndPublishesEvent() {
        ShipmentTracking delayed = ShipmentTracking.builder()
                .id(1L)
                .orderId(10L)
                .supplierId(5L)
                .shipmentTrackingNumber("TRK-DELAY")
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .estimatedDeliveryDate(LocalDateTime.now().minusDays(2)) // past
                .delayDetected(false)
                .build();

        when(shipmentTrackingRepository.findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED))
                .thenReturn(List.of(delayed));
        when(shipmentTrackingRepository.save(any(ShipmentTracking.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(kafkaTemplate.send(anyString(), anyString(), any()))
                .thenReturn(mock(java.util.concurrent.CompletableFuture.class));

        service.detectDelays();

        assertTrue(delayed.isDelayDetected(), "delayDetected flag should be set to true");
        verify(shipmentTrackingRepository).save(delayed);

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(kafkaTemplate).send(eq("delay-events"), eq("1"), eventCaptor.capture());
        ShipmentDelayedEvent event = (ShipmentDelayedEvent) eventCaptor.getValue();
        assertEquals(1L, event.getShipmentId());
        assertEquals(10L, event.getOrderId());
        assertEquals(5L, event.getSupplierId());
        assertEquals("TRK-DELAY", event.getShipmentTrackingNumber());
        assertNotNull(event.getDetectedAt());
    }

    @Test
    void detectDelays_OnTimeShipment_DoesNotSetFlagOrPublishEvent() {
        ShipmentTracking onTime = ShipmentTracking.builder()
                .id(2L)
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .estimatedDeliveryDate(LocalDateTime.now().plusDays(2)) // future → NOT delayed
                .delayDetected(false)
                .build();

        when(shipmentTrackingRepository.findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED))
                .thenReturn(List.of(onTime));

        service.detectDelays();

        assertFalse(onTime.isDelayDetected(), "delayDetected must remain false for on-time shipment");
        verify(shipmentTrackingRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    @Test
    void detectDelays_NoShipments_CompletesWithoutError() {
        when(shipmentTrackingRepository.findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED))
                .thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> service.detectDelays());
        verify(shipmentTrackingRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    // -----------------------------------------------------------------------
    // flagSingleDelay() – duplicate prevention
    // -----------------------------------------------------------------------

    @Test
    void flagSingleDelay_AlreadyFlagged_NoDuplicateEventPublished() {
        ShipmentTracking alreadyFlagged = ShipmentTracking.builder()
                .id(3L)
                .orderId(20L)
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .estimatedDeliveryDate(LocalDateTime.now().minusDays(1))
                .delayDetected(true) // already flagged
                .build();

        service.flagSingleDelay(alreadyFlagged, LocalDateTime.now());

        verify(shipmentTrackingRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any());
    }

    @Test
    void flagSingleDelay_KafkaUnavailable_StillPersistsFlag() {
        ShipmentTracking shipment = ShipmentTracking.builder()
                .id(4L)
                .orderId(30L)
                .supplierId(7L)
                .shipmentTrackingNumber("TRK-NOKA")
                .shipmentStatus(ShipmentStatus.SHIPPED)
                .estimatedDeliveryDate(LocalDateTime.now().minusDays(1))
                .delayDetected(false)
                .build();

        // No kafkaTemplate injected → simulates unavailability
        DeliveryDelayDetectionService serviceNoKafka = new DeliveryDelayDetectionService(shipmentTrackingRepository);
        ReflectionTestUtils.setField(serviceNoKafka, "kafkaTemplate", null);
        ReflectionTestUtils.setField(serviceNoKafka, "delayEventsTopic", "delay-events");

        when(shipmentTrackingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() -> serviceNoKafka.flagSingleDelay(shipment, LocalDateTime.now()));
        assertTrue(shipment.isDelayDetected(), "Flag must still be persisted even without Kafka");
        verify(shipmentTrackingRepository).save(shipment);
    }
}
