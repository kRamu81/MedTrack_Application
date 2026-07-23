package com.medtrack.supplier.service;

import com.medtrack.supplier.event.ShipmentDelayedEvent;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Phase 7 – Delivery Delay Detection Service.
 *
 * <p>
 * Polls the shipment repository on a fixed schedule and flags any shipment
 * whose estimated delivery date has passed and is not yet delivered.
 * A {@link ShipmentDelayedEvent} is published to Kafka exactly once per
 * shipment
 * (idempotency is guaranteed by the {@code delayDetected} flag on the entity).
 * </p>
 */
@Service
@RequiredArgsConstructor
public class DeliveryDelayDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryDelayDetectionService.class);

    private final ShipmentTrackingRepository shipmentTrackingRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.delay-events:delay-events}")
    private String delayEventsTopic;

    /**
     * Runs every {@code app.delay.check.interval-ms} milliseconds (default 60 s).
     * Finds all non-delivered shipments not yet flagged as delayed and checks
     * whether
     * their estimated delivery date is in the past.
     */
    @Scheduled(fixedDelayString = "${app.delay.check.interval-ms:60000}")
    public void detectDelays() {
        log.debug("Running delivery delay detection scan...");

        List<ShipmentTracking> candidates = shipmentTrackingRepository
                .findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED);

        LocalDateTime now = LocalDateTime.now();
        int flaggedCount = 0;

        for (ShipmentTracking shipment : candidates) {
            if (shipment.getEstimatedDeliveryDate() != null
                    && shipment.getEstimatedDeliveryDate().isBefore(now)) {
                flagSingleDelay(shipment, now);
                flaggedCount++;
            }
        }

        if (flaggedCount > 0) {
            log.info("Delay detection scan complete. Flagged {} delayed shipment(s).", flaggedCount);
        } else {
            log.debug("Delay detection scan complete. No new delayed shipments found.");
        }
    }

    /**
     * Flags a single shipment as delayed, persists the flag, and publishes the
     * Kafka event.
     * Wrapped in its own transaction so a failure on one shipment does not roll
     * back others.
     */
    @Transactional
    public void flagSingleDelay(ShipmentTracking shipment, LocalDateTime detectedAt) {
        // Guard: double-check the flag (handles concurrent calls)
        if (shipment.isDelayDetected()) {
            return;
        }

        shipment.setDelayDetected(true);
        shipment.setUpdatedAt(LocalDateTime.now());
        ShipmentTracking saved = shipmentTrackingRepository.save(shipment);

        log.warn("Shipment [id={}, tracking={}] is delayed. Estimated: {}, Detected at: {}",
                saved.getId(), saved.getShipmentTrackingNumber(),
                saved.getEstimatedDeliveryDate(), detectedAt);

        publishDelayEvent(saved, detectedAt);
    }

    private void publishDelayEvent(ShipmentTracking shipment, LocalDateTime detectedAt) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available. Skipping delay event for shipment ID: {}", shipment.getId());
            return;
        }
        try {
            ShipmentDelayedEvent event = ShipmentDelayedEvent.builder()
                    .shipmentId(shipment.getId())
                    .orderId(shipment.getOrderId())
                    .supplierId(shipment.getSupplierId())
                    .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                    .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                    .detectedAt(detectedAt)
                    .build();
            kafkaTemplate.send(delayEventsTopic, String.valueOf(shipment.getId()), event);
            log.info("Published ShipmentDelayedEvent for shipment ID: {}", shipment.getId());
        } catch (Exception e) {
            log.error("Failed to publish delay event for shipment ID: {} – {}", shipment.getId(), e.getMessage(), e);
        }
    }
}
