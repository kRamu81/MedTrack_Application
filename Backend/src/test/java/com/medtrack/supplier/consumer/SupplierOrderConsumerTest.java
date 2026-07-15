package com.medtrack.supplier.consumer;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.event.OrderPlacedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SupplierOrderConsumerTest {

    @Mock
    private EquipmentOrderRepository orderRepository;

    @InjectMocks
    private SupplierOrderConsumer orderConsumer;

    private OrderPlacedEvent validEvent;

    @BeforeEach
    void setUp() {
        validEvent = OrderPlacedEvent.builder()
                .orderCode("ORD-1001")
                .equipmentId("EQ-55")
                .equipmentName("Defibrillator")
                .quantity(3)
                .unitCost(new BigDecimal("5000.00"))
                .hospital("City Mercy Hospital")
                .createdBy("admin@citymercy.org")
                .notes("Deliver to ICU wing")
                .price("₹15,000")
                .build();
    }

    @Test
    void consume_Success_NewOrder() {
        when(orderRepository.findByOrderCode("ORD-1001")).thenReturn(Optional.empty());
        when(orderRepository.save(any(EquipmentOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderConsumer.consume(validEvent));

        ArgumentCaptor<EquipmentOrder> orderCaptor = ArgumentCaptor.forClass(EquipmentOrder.class);
        verify(orderRepository, times(1)).save(orderCaptor.capture());

        EquipmentOrder savedOrder = orderCaptor.getValue();
        assertEquals("ORD-1001", savedOrder.getOrderCode());
        assertEquals("EQ-55", savedOrder.getEquipmentId());
        assertEquals("Defibrillator", savedOrder.getEquipmentName());
        assertEquals(3, savedOrder.getQuantity());
        assertEquals(new BigDecimal("5000.00"), savedOrder.getUnitCost());
        assertEquals("City Mercy Hospital", savedOrder.getHospital());
        assertEquals("admin@citymercy.org", savedOrder.getCreatedBy());
        assertEquals("Deliver to ICU wing", savedOrder.getNotes());
        assertEquals("₹15,000", savedOrder.getPrice());
        assertEquals("PENDING", savedOrder.getStatus());
        assertEquals("Processing", savedOrder.getShippingStatus());
        assertNotNull(savedOrder.getOrderDate());
    }

    @Test
    void consume_Success_ExistingOrder() {
        EquipmentOrder existingOrder = EquipmentOrder.builder()
                .id(123L)
                .orderCode("ORD-1001")
                .status("PENDING")
                .shippingStatus("Processing")
                .build();

        when(orderRepository.findByOrderCode("ORD-1001")).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(EquipmentOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderConsumer.consume(validEvent));

        verify(orderRepository, times(1)).save(existingOrder);
        assertEquals("EQ-55", existingOrder.getEquipmentId());
        assertEquals("Defibrillator", existingOrder.getEquipmentName());
        assertEquals(3, existingOrder.getQuantity());
        assertEquals(new BigDecimal("5000.00"), existingOrder.getUnitCost());
        assertEquals("City Mercy Hospital", existingOrder.getHospital());
        assertEquals("admin@citymercy.org", existingOrder.getCreatedBy());
        assertEquals("Deliver to ICU wing", existingOrder.getNotes());
        assertEquals("₹15,000", existingOrder.getPrice());
        assertNotNull(existingOrder.getUpdatedAt());
    }

    @Test
    void consume_InvalidPayload_ValidationFails() {
        OrderPlacedEvent invalidEvent = OrderPlacedEvent.builder()
                .orderCode("") // Invalid empty order code
                .equipmentId("EQ-55")
                .equipmentName("Defibrillator")
                .quantity(3)
                .hospital("City Mercy Hospital")
                .createdBy("admin@citymercy.org")
                .build();

        assertDoesNotThrow(() -> orderConsumer.consume(invalidEvent));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void consume_InvalidQuantity_ValidationFails() {
        validEvent.setQuantity(-1); // Invalid quantity

        assertDoesNotThrow(() -> orderConsumer.consume(validEvent));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void consume_NullEvent_HandlesGracefully() {
        assertDoesNotThrow(() -> orderConsumer.consume(null));
        verify(orderRepository, never()).save(any());
    }
}
