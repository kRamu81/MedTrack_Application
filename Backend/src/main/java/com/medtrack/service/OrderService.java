package com.medtrack.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.util.PurchaseOrderPdf;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.medtrack.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final EquipmentOrderRepository orderRepository;
    private final PurchaseOrderPdf purchaseOrderPdf;

    public List<EquipmentOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public EquipmentOrder getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
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
        order.setSupplierNotes(supplierNotes);
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
    public byte[] generatePurchaseOrderPdf(Long id) {
        EquipmentOrder order = getOrderById(id);
        return purchaseOrderPdf.generate(order);
    }

    public void deleteOrder(Long id) {
        EquipmentOrder order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found with id: " + id));

        orderRepository.delete(order);
    }
}
