package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
