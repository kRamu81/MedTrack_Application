package com.medtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalAnalyticsDto {
    private BigDecimal totalSpend;
    private Map<String, BigDecimal> spendByCategory;
    private double slaComplianceRate;
    private double meanTimeToRepairHours;
    private long criticalFailingAssetsCount;
    private double downtimePercentage;
    private long upcomingWarrantyExpirationsCount;
}
