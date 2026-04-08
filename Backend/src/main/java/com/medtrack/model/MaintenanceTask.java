package com.medtrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MaintenanceTask Entity - Enhanced to match TaskList.jsx expectations
 */
@Entity
@Table(name = "maintenance_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskCode;
    private String equipmentId;
    private String equipment; // Matches frontend task.equipment
    private String hospital;  // Matches frontend task.hospital
    private String maintenanceType;
    private LocalDate deadline; // Matches frontend task.deadline (previously scheduledDate)
    private String assignedTechnician;
    private String description;
    private String priority; // "Critical", "High", "Normal"
    private String image;    // Optional image URL/base64

    @Builder.Default
    private String status = "Scheduled";

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Double hoursWorked; // Matches frontend task.hours (previously hoursSpent)

    private String partsUsed; // To match technician report

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
