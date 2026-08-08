package com.medtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceCalendarResponse {
    private Long totalSchedules;
    private Long scheduled;
    private Long completed;
    private Long inProgress;
    private Long totalOverdue;
    private List<MaintenanceScheduleResponse> schedules;
}