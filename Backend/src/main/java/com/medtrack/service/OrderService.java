package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.util.PurchaseOrderPdf;
import com.medtrack.dto.SupplierMetricsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.medtrack.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.medtrack.util.SupplierInvoicePdf;
import com.medtrack.auth.service.EmailService;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final EquipmentOrderRepository orderRepository;
    private final PurchaseOrderPdf purchaseOrderPdf;
    private final SupplierInvoicePdf supplierInvoicePdf;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public byte[] generateInvoicePdf(Long id) {
        EquipmentOrder order = getOrderById(id);
        return supplierInvoicePdf.generate(order);
    }

    public void emailInvoice(Long id) {
        EquipmentOrder order = getOrderById(id);
        byte[] pdf = supplierInvoicePdf.generate(order);
        String recipient = order.getCreatedBy();
        if (recipient == null || recipient.trim().isEmpty()) {
            recipient = "admin@hospital.com";
        }
        emailService.sendInvoiceEmail(recipient, order.getOrderCode(), pdf);
    }


    private String getCurrentUserOrganization() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getOrganization)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isSupplier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPPLIER"));
    }

    public List<EquipmentOrder> getAllOrders() {
        if (isSupplier()) {
            return orderRepository.findAll();
        }
        return orderRepository.findByHospital(getCurrentUserOrganization());
    }

    public EquipmentOrder getOrderById(Long id) {
        EquipmentOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (!isSupplier()) {
            String hospital = getCurrentUserOrganization();
            if (!order.getHospital().equals(hospital)) {
                throw new ResourceNotFoundException("Order not found with id: " + id);
            }
        }
        return order;
    }

    public EquipmentOrder placeOrder(EquipmentOrder order) {
        if (order.getOrderCode() == null) {
            order.setOrderCode("ORD-" + java.util.UUID.randomUUID().toString());
        }
        return orderRepository.save(order);
    }

    public EquipmentOrder updateOrderStatus(Long id, String status, String supplierNotes) {
        EquipmentOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        order.setStatus(status);
        order.setShippingStatus(status);
        order.setSupplierNotes(supplierNotes);
        order.setUpdatedAt(LocalDateTime.now());

        if ("Shipped".equalsIgnoreCase(status) || "Dispatched".equalsIgnoreCase(status)) {
            order.setDispatchedAt(LocalDateTime.now());
            if (order.getTrackingNo() == null) {
                order.setTrackingNo("TRK-" + (int)(Math.random() * 900000 + 100000));
            }
            if (order.getCarrier() == null) {
                order.setCarrier("MedExpress Logistics");
            }
        } else if ("Delivered".equalsIgnoreCase(status)) {
            if (order.getDispatchedAt() == null) {
                order.setDispatchedAt(LocalDateTime.now().minusDays(2)); // baseline fallback
            }
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        return orderRepository.save(order);
    }

    public byte[] generatePurchaseOrderPdf(Long id) {
        EquipmentOrder order = getOrderById(id);
        return purchaseOrderPdf.generate(order);
    }

    public void deleteOrder(Long id) {
        EquipmentOrder order = getOrderById(id);
        orderRepository.delete(order);
    }

    public SupplierMetricsDto getSupplierMetrics() {
        List<EquipmentOrder> orders = getAllOrders();
        long total = orders.size();
        
        long pending = orders.stream()
                .filter(o -> !"Delivered".equalsIgnoreCase(o.getShippingStatus()))
                .count();
        
        long shipped = orders.stream()
                .filter(o -> "Shipped".equalsIgnoreCase(o.getShippingStatus()))
                .count();
        
        long delivered = orders.stream()
                .filter(o -> "Delivered".equalsIgnoreCase(o.getShippingStatus()))
                .count();

        // Calculate average delivery time in days for all delivered orders
        double avgDays = orders.stream()
                .filter(o -> "Delivered".equalsIgnoreCase(o.getShippingStatus()) 
                        && o.getOrderDate() != null 
                        && o.getDeliveredAt() != null)
                .mapToLong(o -> ChronoUnit.DAYS.between(o.getOrderDate(), o.getDeliveredAt()))
                .average()
                .orElse(0.0);

        // Benchmark SLA: Deliver within 7 days is on-time
        long deliveredCount = orders.stream()
                .filter(o -> "Delivered".equalsIgnoreCase(o.getShippingStatus()))
                .count();

        long onTimeCount = orders.stream()
                .filter(o -> "Delivered".equalsIgnoreCase(o.getShippingStatus())
                        && o.getOrderDate() != null 
                        && o.getDeliveredAt() != null
                        && ChronoUnit.DAYS.between(o.getOrderDate(), o.getDeliveredAt()) <= 7)
                .count();

        double onTimeRate = deliveredCount > 0 
                ? (double) onTimeCount * 100.0 / deliveredCount 
                : 100.0; // default to 100% if no orders delivered yet

        // Round average days and onTimeRate to 1 decimal place
        avgDays = Math.round(avgDays * 10.0) / 10.0;
        onTimeRate = Math.round(onTimeRate * 10.0) / 10.0;

        return SupplierMetricsDto.builder()
                .totalOrders(total)
                .pendingOrders(pending)
                .shippedOrders(shipped)
                .deliveredOrders(delivered)
                .averageDeliveryDays(avgDays)
                .onTimeRate(onTimeRate)
                .build();
    }
}
