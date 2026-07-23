package com.medtrack.service;

import com.medtrack.dto.HospitalAnalyticsDto;
import com.medtrack.model.Equipment;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.model.EquipmentStatus;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private MaintenanceTaskRepository taskRepository;

    @Mock
    private EquipmentOrderRepository orderRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void getHospitalAnalytics_ComputesCorrectStatistics() {
        Long hospitalId = 1L;

        // Mock Equipment
        Equipment eq1 = Equipment.builder()
                .id(1L)
                .name("MRI Scanner")
                .category("Imaging")
                .status(EquipmentStatus.ACTIVE)
                .warrantyExpiry(LocalDate.now().plusDays(15)) // upcoming warranty expiration
                .build();

        Equipment eq2 = Equipment.builder()
                .id(2L)
                .name("Infusion Pump")
                .category("Monitoring")
                .status(EquipmentStatus.UNDER_MAINTENANCE) // downtime indicator
                .warrantyExpiry(LocalDate.now().plusDays(100))
                .build();

        // Mock Maintenance Tasks
        MaintenanceTask task1 = MaintenanceTask.builder()
                .id(10L)
                .hospitalId(hospitalId)
                .status(MaintenanceStatus.COMPLETED)
                .hoursWorked(3.0)
                .createdAt(LocalDateTime.now().minusDays(5))
                .completedAt(LocalDateTime.now().minusDays(2))
                .deadline(LocalDate.now().minusDays(1))
                .build();

        MaintenanceTask task2 = MaintenanceTask.builder()
                .id(20L)
                .hospitalId(hospitalId)
                .status(MaintenanceStatus.COMPLETED)
                .hoursWorked(5.0)
                .createdAt(LocalDateTime.now().minusDays(5))
                .completedAt(LocalDateTime.now().minusDays(3))
                .deadline(LocalDate.now().minusDays(4))
                .build();

        MaintenanceTask task3 = MaintenanceTask.builder()
                .id(30L)
                .hospitalId(hospitalId)
                .status(MaintenanceStatus.SCHEDULED)
                .priority("CRITICAL") // critical pending
                .build();

        MaintenanceTask legacyCompletedTask = MaintenanceTask.builder()
                .id(40L)
                .hospitalId(hospitalId)
                .status(MaintenanceStatus.COMPLETED)
                .deadline(LocalDate.now().minusDays(10))
                .build();

        // Mock Orders
        EquipmentOrder order1 = EquipmentOrder.builder()
                .id(100L)
                .equipmentName("MRI Scanner")
                .shippingStatus("Delivered")
                .totalCost(BigDecimal.valueOf(150000.00))
                .build();

        EquipmentOrder order2 = EquipmentOrder.builder()
                .id(200L)
                .equipmentName("Infusion Pump")
                .shippingStatus("Delivered")
                .totalCost(BigDecimal.valueOf(5000.00))
                .build();

        EquipmentOrder order3 = EquipmentOrder.builder()
                .id(300L)
                .equipmentName("Ventilator Beta") // keyword fallback category "Respiratory"
                .shippingStatus("Delivered")
                .totalCost(BigDecimal.valueOf(25000.00))
                .build();

        EquipmentOrder order4 = EquipmentOrder.builder()
                .id(400L)
                .equipmentName("Surgical Laser")
                .shippingStatus("Processing") // not delivered, should not count towards spend
                .totalCost(BigDecimal.valueOf(99999.00))
                .build();

        when(equipmentRepository.findByHospitalId(hospitalId)).thenReturn(Arrays.asList(eq1, eq2));
        when(taskRepository.findByHospitalId(hospitalId))
                .thenReturn(Arrays.asList(task1, task2, task3, legacyCompletedTask));
        when(orderRepository.findAll()).thenReturn(Arrays.asList(order1, order2, order3, order4));

        HospitalAnalyticsDto dto = analyticsService.getHospitalAnalytics(hospitalId);

        assertNotNull(dto);
        // Spend check: 150000 + 5000 + 25000 = 180000.00
        assertEquals(0, BigDecimal.valueOf(180000.00).compareTo(dto.getTotalSpend()));

        // Spend category mapping check
        assertEquals(0, BigDecimal.valueOf(150000.00).compareTo(dto.getSpendByCategory().get("Imaging")));
        assertEquals(0, BigDecimal.valueOf(5000.00).compareTo(dto.getSpendByCategory().get("Monitoring")));
        assertEquals(0, BigDecimal.valueOf(25000.00).compareTo(dto.getSpendByCategory().get("Respiratory")));
        assertNull(dto.getSpendByCategory().get("Surgical")); // processing order shouldn't count

        // SLA rate check: 1 of 2 measurable completions is compliant. The legacy
        // completed row without a trustworthy timestamp is excluded.
        assertEquals(50.0, dto.getSlaComplianceRate());

        // MTTR check: (3 + 5) / 2 = 4.0 hours
        assertEquals(4.0, dto.getMeanTimeToRepairHours());

        // Downtime: 1 under maintenance out of 2 units -> 50%
        assertEquals(50.0, dto.getDowntimePercentage());

        // Critical count: 1 pending critical task
        assertEquals(1, dto.getCriticalFailingAssetsCount());

        // Warranty: eq1 expires in 15 days, eq2 in 100 days -> 1 upcoming
        assertEquals(1, dto.getUpcomingWarrantyExpirationsCount());
    }
}
