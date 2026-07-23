package com.medtrack.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.medtrack.model.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Technician-controlled partial report fields accepted for an assigned task.
 * Null optional values preserve the corresponding stored value.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MaintenanceUpdateRequest {

    @NotNull(message = "Status is required")
    private MaintenanceStatus status;

    private String notes;

    @PositiveOrZero(message = "Hours worked cannot be negative")
    private Double hoursWorked;

    private String partsUsed;
    private String signature;

    // Accepted for compatibility, but the service never changes the stored recurrence.
    @PositiveOrZero(message = "Recurrence period cannot be negative")
    private Integer recurrencePeriodDays;
}
