package com.medtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleRequest {
    private Long equipmentId;
    private String title;
    private String description;
    private String assignedTechnician;
    private String maintenanceType;
    private String priority;
    private LocalDate scheduledDate;
    private Integer estimatedDurationHours;
    private Integer reminderDays;
    private String notes;
    private String recurrence;
}