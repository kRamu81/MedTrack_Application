package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierOrderService {

    private final EquipmentOrderRepository orderRepository;

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

        order.setStatus(requestedStatus.name());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }
}
