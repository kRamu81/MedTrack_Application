package com.medtrack.service;

import com.medtrack.dto.HospitalAnalyticsDto;
import com.medtrack.model.Equipment;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final EquipmentOrderRepository orderRepository;

    public HospitalAnalyticsDto getHospitalAnalytics(Long hospitalId) {
        // Fetch equipment for hospital
        List<Equipment> equipmentList = equipmentRepository.findByHospitalId(hospitalId);
        
        // Fetch tasks for hospital
        List<MaintenanceTask> tasks = taskRepository.findByHospitalId(hospitalId);
        
        // Fetch all orders
        List<EquipmentOrder> orders = orderRepository.findAll();

        // 1. Downtime Percentage
        long totalEquipment = equipmentList.size();
        long underMaintenanceCount = equipmentList.stream()
                .filter(eq -> eq.getStatus() == com.medtrack.model.EquipmentStatus.UNDER_MAINTENANCE)
                .count();
        double downtimePercentage = totalEquipment > 0
                ? (underMaintenanceCount * 100.0) / totalEquipment
                : 0.0;

        // 2. Upcoming Warranty Expirations (within next 30 days)
        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(30);
        long upcomingWarrantyCount = equipmentList.stream()
                .filter(eq -> eq.getWarrantyExpiry() != null 
                        && !eq.getWarrantyExpiry().isBefore(today) 
                        && !eq.getWarrantyExpiry().isAfter(limit))
                .count();

        // 3. Maintenance SLA & MTTR
        List<MaintenanceTask> completedTasks = tasks.stream()
                .filter(t -> t.getStatus() == MaintenanceStatus.COMPLETED)
                .toList();

        List<MaintenanceTask> measurableCompletedTasks = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null && task.getDeadline() != null)
                .toList();
        long compliantCount = measurableCompletedTasks.stream()
                .filter(task -> !task.getCompletedAt().toLocalDate().isAfter(task.getDeadline()))
                .count();

        // Legacy completed rows without an auditable completion timestamp are excluded.
        double slaCompliance = measurableCompletedTasks.isEmpty()
                ? 100.0
                : (compliantCount * 100.0) / measurableCompletedTasks.size();

        double mttr = completedTasks.stream()
                .filter(t -> t.getHoursWorked() != null)
                .mapToDouble(MaintenanceTask::getHoursWorked)
                .average()
                .orElse(0.0);

        // 4. Critical Pending Count
        long criticalPending = tasks.stream()
                .filter(t -> t.getStatus() != MaintenanceStatus.COMPLETED 
                        && "CRITICAL".equalsIgnoreCase(t.getPriority()))
                .count();

        // 5. Total Spend & Category Spend on Delivered Orders
        BigDecimal totalSpend = BigDecimal.ZERO;
        Map<String, BigDecimal> spendByCategory = new HashMap<>();

        for (EquipmentOrder order : orders) {
            if ("Delivered".equalsIgnoreCase(order.getShippingStatus())) {
                BigDecimal cost = order.getTotalCost() != null ? order.getTotalCost() : BigDecimal.ZERO;
                totalSpend = totalSpend.add(cost);

                // Map to category
                String category = resolveCategory(order, equipmentList);
                spendByCategory.put(category, spendByCategory.getOrDefault(category, BigDecimal.ZERO).add(cost));
            }
        }

        return HospitalAnalyticsDto.builder()
                .totalSpend(totalSpend)
                .spendByCategory(spendByCategory)
                .slaComplianceRate(slaCompliance)
                .meanTimeToRepairHours(mttr)
                .criticalFailingAssetsCount(criticalPending)
                .downtimePercentage(downtimePercentage)
                .upcomingWarrantyExpirationsCount(upcomingWarrantyCount)
                .build();
    }

    private String resolveCategory(EquipmentOrder order, List<Equipment> equipmentList) {
        // Try matching with equipment list
        for (Equipment eq : equipmentList) {
            if (eq.getName() != null && eq.getName().equalsIgnoreCase(order.getEquipmentName())) {
                if (eq.getCategory() != null) {
                    return eq.getCategory();
                }
            }
        }

        // Keyword fallback
        String name = order.getEquipmentName();
        if (name == null) return "Other";
        String lower = name.toLowerCase();
        if (lower.contains("mri") || lower.contains("scan") || lower.contains("imaging")) {
            return "Imaging";
        }
        if (lower.contains("pump") || lower.contains("monitor")) {
            return "Monitoring";
        }
        if (lower.contains("ventilator") || lower.contains("respiratory")) {
            return "Respiratory";
        }
        if (lower.contains("laser") || lower.contains("surgical")) {
            return "Surgical";
        }
        return "Other";
    }
}
