package com.medtrack.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.medtrack.validation.MaintenanceValidationLimits.SHORT_TEXT_MAX_LENGTH;

/**
 * Hospital-controlled technician assignment for a scheduled maintenance task.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MaintenanceAssignmentRequest {

    @NotBlank(message = "Assigned technician is required")
    @Size(max = SHORT_TEXT_MAX_LENGTH, message = "Assigned technician must not exceed 255 characters")
    private String assignedTechnician;
}
