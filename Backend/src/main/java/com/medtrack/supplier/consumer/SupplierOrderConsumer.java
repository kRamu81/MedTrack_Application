package com.medtrack.supplier.consumer;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class SupplierOrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(SupplierOrderConsumer.class);
    private final EquipmentOrderRepository orderRepository;

    @KafkaListener(topics = "${app.kafka.topics.order-events:order-events}", groupId = "${spring.kafka.consumer.group-id:supplier-order-sync}")
    @Transactional
    public void consume(OrderPlacedEvent event) {
        try {
            validateEvent(event);
            log.info("Received OrderPlacedEvent for order code: [{}]", event.getOrderCode());

            EquipmentOrder order = orderRepository.findByOrderCode(event.getOrderCode())
                    .orElseGet(() -> {
                        log.info("Creating new supplier-side order record for order code: [{}]", event.getOrderCode());
                        return EquipmentOrder.builder()
                                .orderCode(event.getOrderCode())
                                .status("PENDING")
                                .shippingStatus("Processing")
                                .orderDate(LocalDateTime.now())
                                .build();
                    });

            // Map and update event data
            order.setEquipmentId(event.getEquipmentId());
            order.setEquipmentName(event.getEquipmentName());
            order.setQuantity(event.getQuantity());
            order.setUnitCost(event.getUnitCost());
            order.setHospital(event.getHospital());
            order.setCreatedBy(event.getCreatedBy());
            order.setNotes(event.getNotes());
            order.setPrice(event.getPrice());
            order.setUpdatedAt(LocalDateTime.now());

            orderRepository.save(order);
            log.info("Successfully synchronized supplier-side order data for order code: [{}]", event.getOrderCode());
        } catch (IllegalArgumentException e) {
            log.error("Validation failed for OrderPlacedEvent: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to process OrderPlacedEvent due to error: {}", e.getMessage(), e);
        }
    }

    private void validateEvent(OrderPlacedEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
        if (event.getOrderCode() == null || event.getOrderCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Order code is required");
        }
        if (event.getEquipmentId() == null || event.getEquipmentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Equipment ID is required");
        }
        if (event.getEquipmentName() == null || event.getEquipmentName().trim().isEmpty()) {
            throw new IllegalArgumentException("Equipment name is required");
        }
        if (event.getQuantity() == null || event.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        if (event.getHospital() == null || event.getHospital().trim().isEmpty()) {
            throw new IllegalArgumentException("Hospital name is required");
        }
        if (event.getCreatedBy() == null || event.getCreatedBy().trim().isEmpty()) {
            throw new IllegalArgumentException("CreatedBy is required");
        }
    }
}
