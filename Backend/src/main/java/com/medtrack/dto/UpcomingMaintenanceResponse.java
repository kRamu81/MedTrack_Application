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
public class UpcomingMaintenanceResponse {
    private Long taskId;
    private Long equipmentId;
    private String equipmentName;
    private LocalDate scheduledDate;
    private String assignedTechnician;
    private MaintenanceStatus status;
}