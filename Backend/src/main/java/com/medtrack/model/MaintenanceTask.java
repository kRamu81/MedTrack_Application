package com.medtrack.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private String equipment;
    private String hospital;

    // Stable ownership key used by the service to isolate one hospital's tasks from another.
    @Column(name = "hospital_id")
    private Long hospitalId;

    private String maintenanceType;
    private LocalDate deadline;
    private String assignedTechnician;
    private String description;
    private String priority;
    private String image;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Double hoursWorked;

    private String partsUsed;

    @Column(columnDefinition = "TEXT")
    private String signature;

    private Integer recurrencePeriodDays;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
