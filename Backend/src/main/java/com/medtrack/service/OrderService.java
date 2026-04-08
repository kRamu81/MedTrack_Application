package com.medtrack.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final EquipmentOrderRepository orderRepository;

    public List<EquipmentOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public EquipmentOrder placeOrder(EquipmentOrder order) {
        if (order.getOrderCode() == null) {
            order.setOrderCode("ORD-" + System.currentTimeMillis() % 10000);
        }
        return orderRepository.save(order);
    }

    public EquipmentOrder updateOrderStatus(Long id, String status, String supplierNotes) {
        EquipmentOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        order.setSupplierNotes(supplierNotes);
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
