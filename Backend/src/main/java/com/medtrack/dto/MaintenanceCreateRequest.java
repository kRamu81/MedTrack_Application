package com.medtrack.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Hospital-controlled fields accepted when scheduling maintenance.
 * Identity, ownership, workflow status, and technician evidence are server-controlled.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MaintenanceCreateRequest {

    @NotBlank(message = "Equipment ID is required")
    private String equipmentId;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    private String assignedTechnician;
    private String description;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "Normal|High|Critical", message = "Priority must be Normal, High, or Critical")
    private String priority;

    private String image;

    @PositiveOrZero(message = "Recurrence period cannot be negative")
    private Integer recurrencePeriodDays;
}
