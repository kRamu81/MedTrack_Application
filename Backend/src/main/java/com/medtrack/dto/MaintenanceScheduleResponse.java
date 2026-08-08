package com.medtrack.dto;

import com.medtrack.model.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String title;
    private String assignedTechnician;
    private String maintenanceType;
    private String priority;
    private MaintenanceStatus status;
    private LocalDate scheduledDate;
    private LocalDate nextMaintenanceDate;
    private Integer estimatedDurationHours;
    private Integer reminderDays;
    private String notes;
    private String recurrence;
    private boolean overdue;
    private boolean upcoming;
}