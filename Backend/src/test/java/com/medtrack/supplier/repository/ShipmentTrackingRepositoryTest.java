package com.medtrack.supplier.repository;

import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.medtrack.auth.service.KafkaEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
                "eureka.client.enabled=false",
                "spring.cloud.discovery.enabled=false",
                "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
@Transactional
public class ShipmentTrackingRepositoryTest {

        @MockitoBean
        private KafkaEventPublisher kafkaEventPublisher;

        @Autowired
        private ShipmentTrackingRepository repository;

        @Test
        public void testSaveAndFindShipmentTracking() {
                ShipmentTracking tracking = ShipmentTracking.builder()
                                .orderId(101L)
                                .shipmentTrackingNumber("TRK-10001")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(3))
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(201L)
                                .build();

                ShipmentTracking saved = repository.save(tracking);
                assertNotNull(saved.getId());
                assertNotNull(saved.getCreatedAt());
                assertNull(saved.getUpdatedAt());

                Optional<ShipmentTracking> found = repository.findById(saved.getId());
                assertTrue(found.isPresent());
                assertEquals("TRK-10001", found.get().getShipmentTrackingNumber());
        }

        @Test
        public void testUniqueTrackingNumberConstraint() {
                ShipmentTracking tracking1 = ShipmentTracking.builder()
                                .orderId(101L)
                                .shipmentTrackingNumber("TRK-DUP")
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(201L)
                                .build();

                repository.saveAndFlush(tracking1);

                ShipmentTracking tracking2 = ShipmentTracking.builder()
                                .orderId(102L)
                                .shipmentTrackingNumber("TRK-DUP")
                                .shipmentStatus(ShipmentStatus.CONFIRMED)
                                .supplierId(201L)
                                .build();

                assertThrows(DataIntegrityViolationException.class, () -> {
                        repository.saveAndFlush(tracking2);
                });
        }

        @Test
        public void testFindByShipmentStatus() {
                ShipmentTracking tracking1 = ShipmentTracking.builder()
                                .orderId(101L)
                                .shipmentTrackingNumber("TRK-1A")
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .supplierId(201L)
                                .build();

                ShipmentTracking tracking2 = ShipmentTracking.builder()
                                .orderId(102L)
                                .shipmentTrackingNumber("TRK-2B")
                                .shipmentStatus(ShipmentStatus.DELIVERED)
                                .supplierId(201L)
                                .build();

                repository.save(tracking1);
                repository.save(tracking2);

                List<ShipmentTracking> shippedList = repository.findByShipmentStatus(ShipmentStatus.SHIPPED);
                assertEquals(1, shippedList.size());
                assertEquals("TRK-1A", shippedList.get(0).getShipmentTrackingNumber());
        }

        @Test
        public void testFindByTrackingNumber() {
                ShipmentTracking tracking = ShipmentTracking.builder()
                                .orderId(101L)
                                .shipmentTrackingNumber("TRK-FIND")
                                .shipmentStatus(ShipmentStatus.CONFIRMED)
                                .supplierId(202L)
                                .build();

                repository.save(tracking);

                Optional<ShipmentTracking> found = repository.findByShipmentTrackingNumber("TRK-FIND");
                assertTrue(found.isPresent());
                assertEquals(101L, found.get().getOrderId());
        }

        @Test
        public void testFindBySupplierId() {
                ShipmentTracking tracking1 = ShipmentTracking.builder()
                                .orderId(103L)
                                .shipmentTrackingNumber("TRK-SUP1")
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(500L)
                                .build();

                ShipmentTracking tracking2 = ShipmentTracking.builder()
                                .orderId(104L)
                                .shipmentTrackingNumber("TRK-SUP2")
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(500L)
                                .build();

                repository.save(tracking1);
                repository.save(tracking2);

                List<ShipmentTracking> supplierTrackings = repository.findBySupplierId(500L);
                assertEquals(2, supplierTrackings.size());
        }

        @Test
        public void testFindByEstimatedDeliveryDateBefore() {
                LocalDateTime referenceTime = LocalDateTime.now().plusDays(2);

                ShipmentTracking trackingBefore = ShipmentTracking.builder()
                                .orderId(105L)
                                .shipmentTrackingNumber("TRK-BEFORE")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(1))
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(201L)
                                .build();

                ShipmentTracking trackingAfter = ShipmentTracking.builder()
                                .orderId(106L)
                                .shipmentTrackingNumber("TRK-AFTER")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(3))
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(201L)
                                .build();

                repository.save(trackingBefore);
                repository.save(trackingAfter);

                List<ShipmentTracking> dueTrackings = repository.findByEstimatedDeliveryDateBefore(referenceTime);
                assertEquals(1, dueTrackings.size());
                assertEquals("TRK-BEFORE", dueTrackings.get(0).getShipmentTrackingNumber());
        }
}
