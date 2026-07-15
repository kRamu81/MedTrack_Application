package com.medtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO representing the results of a bulk equipment import operation.
 * Contains counts of successful and failed records along with detailed error reasons.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentImportSummary {
    
    private int successCount;
    private int failureCount;
    private List<RowFailure> failures;

    /**
     * Represents a specific row that failed validation or processing during import.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RowFailure {
        private int rowNumber;
        private String rowData;
        private String reason;
    }
}
