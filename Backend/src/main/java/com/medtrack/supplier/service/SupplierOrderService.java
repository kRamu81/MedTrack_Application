package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierOrderService {

    private static final Logger log = LoggerFactory.getLogger(SupplierOrderService.class);

    private final EquipmentOrderRepository orderRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final UserRepository userRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.order-events:order-events}")
    private String orderEventsTopic;

    private static final List<String> VALID_STATUSES = Arrays.asList(
            "PENDING", "CONFIRMED", "DISPATCHED", "IN_TRANSIT", "DELIVERED");

    private static final List<String> VALID_SHIPPING_STATUSES = Arrays.asList(
            "Processing", "Shipped", "Delivered", "Cancelled");

    @Transactional(readOnly = true)
    public Page<EquipmentOrder> getSupplierOrders(
            int page, int size, String sortBy, String sortDir,
            String status, String shippingStatus, Long supplierId, String search) {

        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must not be less than or equal to zero");
        }

        if (status != null && !status.isEmpty() && !VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }

        if (shippingStatus != null && !shippingStatus.isEmpty() && !VALID_SHIPPING_STATUSES.contains(shippingStatus)) {
            throw new IllegalArgumentException("Invalid shipping status: " + shippingStatus);
        }

        if (supplierId != null && supplierId <= 0) {
            throw new IllegalArgumentException("Supplier ID must be positive");
        }

        // Handle empty or null search
        String searchQuery = (search == null || search.trim().isEmpty()) ? null : search.trim();

        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid sort direction: " + sortDir);
        }

        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        return orderRepository.findSupplierOrders(status, shippingStatus, supplierId, searchQuery, pageable);
    }

    @Transactional
    public EquipmentOrder updateOrderStatus(Long orderId, String newStatus) {
        Set<String> publishedEvents = new HashSet<>();
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException("Invalid resource ID.");
        }
        if (newStatus == null || newStatus.isEmpty()) {
            throw new IllegalArgumentException("Status cannot be blank");
        }

        ShipmentStatus requestedStatus;
        try {
            requestedStatus = ShipmentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        EquipmentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String currentStatusStr = order.getStatus();
        ShipmentStatus currentStatus;
        try {
            currentStatus = ShipmentStatus.valueOf(currentStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidStatusTransitionException(
                    "Legacy order status is not valid for transitions: " + currentStatusStr);
        }

        if (currentStatus == requestedStatus) {
            throw new InvalidStatusTransitionException("State transition from " + currentStatus + " to "
                    + requestedStatus + " is same-state and not allowed.");
        }

        boolean isValidTransition = false;
        if (currentStatus == ShipmentStatus.PENDING && requestedStatus == ShipmentStatus.CONFIRMED) {
            isValidTransition = true;
        } else if (currentStatus == ShipmentStatus.CONFIRMED && requestedStatus == ShipmentStatus.SHIPPED) {
            isValidTransition = true;
        } else if (currentStatus == ShipmentStatus.SHIPPED && requestedStatus == ShipmentStatus.DELIVERED) {
            isValidTransition = true;
        }

        if (!isValidTransition) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + currentStatus + " to " + requestedStatus);
        }

        // Process Shipment state additions
        if (requestedStatus == ShipmentStatus.SHIPPED) {
            ShipmentTracking shipment = shipmentTrackingRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        Long supplierId = resolveSupplierId();
                        return ShipmentTracking.builder()
                                .orderId(orderId)
                                .supplierId(supplierId)
                                .createdAt(LocalDateTime.now())
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .build();
                    });

            if (shipment.getShipmentTrackingNumber() == null || shipment.getShipmentTrackingNumber().isEmpty()) {
                shipment.setShipmentTrackingNumber(generateUniqueTrackingNumber());
            }

            if (shipment.getEstimatedDeliveryDate() == null) {
                shipment.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(3));
            }

            shipment.setShipmentStatus(ShipmentStatus.SHIPPED);
            shipment.setUpdatedAt(LocalDateTime.now());
            shipmentTrackingRepository.save(shipment);

            order.setTrackingNo(shipment.getShipmentTrackingNumber());
            order.setCarrier(order.getCarrier() != null ? order.getCarrier() : "Standard Carrier");
            order.setShippingStatus("Shipped");
            order.setDispatchedAt(LocalDateTime.now());
            order.setEstimatedDelivery(shipment.getEstimatedDeliveryDate().toString());

            scheduleEventPublish(orderId, requestedStatus, shipment, publishedEvents);

        } else if (requestedStatus == ShipmentStatus.DELIVERED) {
            ShipmentTracking shipment = shipmentTrackingRepository.findByOrderId(orderId)
                    .orElseGet(() -> {
                        Long supplierId = resolveSupplierId();
                        return ShipmentTracking.builder()
                                .orderId(orderId)
                                .supplierId(supplierId)
                                .createdAt(LocalDateTime.now())
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .build();
                    });

            shipment.setShipmentStatus(ShipmentStatus.DELIVERED);
            shipment.setActualDeliveryDate(LocalDateTime.now());
            shipment.setUpdatedAt(LocalDateTime.now());
            shipmentTrackingRepository.save(shipment);

            order.setShippingStatus("Delivered");
            order.setDeliveredAt(LocalDateTime.now());

            scheduleEventPublish(orderId, requestedStatus, shipment, publishedEvents);
        }

        order.setStatus(requestedStatus.name());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    private Long resolveSupplierId() {
        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                Optional<com.medtrack.auth.model.User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    return userOpt.get().getId();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to resolve supplierId from security context: {}", e.getMessage());
        }
        return 1L; // default fallback ID
    }

    private String generateUniqueTrackingNumber() {
        String trackingNumber;
        do {
            trackingNumber = "TRK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        } while (shipmentTrackingRepository.findByShipmentTrackingNumber(trackingNumber).isPresent());
        return trackingNumber;
    }

    private void scheduleEventPublish(Long orderId, ShipmentStatus status, ShipmentTracking shipment,
            Set<String> publishedEvents) {
        String eventKey = orderId + ":" + status;
        if (publishedEvents.contains(eventKey)) {
            return;
        }
        publishedEvents.add(eventKey);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publishKafkaEvent(orderId, status, shipment);
                }
            });
        } else {
            publishKafkaEvent(orderId, status, shipment);
        }
    }

    private void publishKafkaEvent(Long orderId, ShipmentStatus status, ShipmentTracking shipment) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate is not available. Skipping event publication for order ID: [{}]", orderId);
            return;
        }
        try {
            if (status == ShipmentStatus.SHIPPED) {
                com.medtrack.supplier.event.OrderShippedEvent event = com.medtrack.supplier.event.OrderShippedEvent
                        .builder()
                        .orderId(orderId)
                        .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                        .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                        .shippedAt(LocalDateTime.now())
                        .supplierId(shipment.getSupplierId())
                        .build();
                log.info("Publishing OrderShippedEvent for order ID: [{}]", orderId);
                kafkaTemplate.send(orderEventsTopic, String.valueOf(orderId), event);
            } else if (status == ShipmentStatus.DELIVERED) {
                com.medtrack.supplier.event.OrderDeliveredEvent event = com.medtrack.supplier.event.OrderDeliveredEvent
                        .builder()
                        .orderId(orderId)
                        .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                        .actualDeliveryDate(shipment.getActualDeliveryDate() != null ? shipment.getActualDeliveryDate()
                                : LocalDateTime.now())
                        .supplierId(shipment.getSupplierId())
                        .build();
                log.info("Publishing OrderDeliveredEvent for order ID: [{}]", orderId);
                kafkaTemplate.send(orderEventsTopic, String.valueOf(orderId), event);
            }
        } catch (Exception e) {
            log.error("Failed to publish Kafka event for order ID: [{}], status: [{}] due to error: {}",
                    orderId, status, e.getMessage(), e);
        }
    }
}
