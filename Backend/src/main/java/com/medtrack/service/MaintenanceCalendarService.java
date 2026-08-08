package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.dto.*;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.model.*;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceCalendarService {

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    private Hospital getHospitalForEmail(String email) {
        return hospitalRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("Hospital not found for email: " + email));
                    return hospitalRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Hospital not found for user: " + email));
                });
    }

    public MaintenanceCalendarResponse getCalendar(String email) {
        Hospital hospital = getHospitalForEmail(email);
        List<MaintenanceTask> allTasks = maintenanceTaskRepository.findByEquipmentHospitalId(hospital.getId());
        LocalDate today = LocalDate.now();

        long total = allTasks.size();
        long scheduled = allTasks.stream().filter(t -> t.getStatus() == MaintenanceStatus.SCHEDULED).count();
        long completed = allTasks.stream().filter(t -> t.getStatus() == MaintenanceStatus.COMPLETED).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus() == MaintenanceStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(task ->
                task.getScheduledDate() != null && task.getScheduledDate().isBefore(today)
                        && task.getStatus() != MaintenanceStatus.COMPLETED).count();

        List<MaintenanceScheduleResponse> schedules = allTasks.stream().map(this::mapToScheduleResponse).toList();
        return MaintenanceCalendarResponse.builder()
                .totalSchedules(total).scheduled(scheduled).completed(completed)
                .inProgress(inProgress).totalOverdue(overdue).schedules(schedules).build();
    }

    public List<UpcomingMaintenanceResponse> getUpcoming(String email) {
        Hospital hospital = getHospitalForEmail(email);
        LocalDate today = LocalDate.now();
        List<MaintenanceTask> tasks = maintenanceTaskRepository
                .findByEquipmentHospitalIdAndScheduledDateBetween(hospital.getId(), today, today.plusDays(30));

        return tasks.stream().map(task -> UpcomingMaintenanceResponse.builder()
                .taskId(task.getId())
                .equipmentId(task.getEquipment() != null ? task.getEquipment().getId() : null)
                .equipmentName(task.getEquipment() != null ? task.getEquipment().getName() : null)
                .scheduledDate(task.getScheduledDate())
                .assignedTechnician(task.getAssignedTechnician())
                .status(task.getStatus()).build()).toList();
    }

    public List<OverdueMaintenanceResponse> getOverdue(String email) {
        Hospital hospital = getHospitalForEmail(email);
        List<MaintenanceTask> tasks = maintenanceTaskRepository
                .findByEquipmentHospitalIdAndScheduledDateBefore(hospital.getId(), LocalDate.now());

        return tasks.stream().map(task -> {
            long days = task.getScheduledDate() != null ? ChronoUnit.DAYS.between(task.getScheduledDate(), LocalDate.now()) : 0;
            return OverdueMaintenanceResponse.builder()
                    .taskId(task.getId())
                    .equipmentId(task.getEquipment() != null ? task.getEquipment().getId() : null)
                    .equipmentName(task.getEquipment() != null ? task.getEquipment().getName() : null)
                    .scheduledDate(task.getScheduledDate())
                    .assignedTechnician(task.getAssignedTechnician())
                    .status(task.getStatus()).daysOverdue(days).build();
        }).toList();
    }

    public MaintenanceScheduleResponse createSchedule(MaintenanceScheduleRequest request, String email) {
        Hospital hospital = getHospitalForEmail(email);
        Equipment equipment = equipmentRepository.findByIdAndHospitalId(request.getEquipmentId(), hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + request.getEquipmentId()));

        MaintenanceTask task = new MaintenanceTask();
        task.setEquipment(equipment);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setScheduledDate(request.getScheduledDate());
        task.setAssignedTechnician(request.getAssignedTechnician());
        task.setPriority(request.getPriority());
        task.setStatus(MaintenanceStatus.SCHEDULED);
        task.setHospitalId(hospital.getId());

        MaintenanceTask saved = maintenanceTaskRepository.save(task);
        return mapToScheduleResponse(saved);
    }

    private MaintenanceScheduleResponse mapToScheduleResponse(MaintenanceTask task) {
        LocalDate today = LocalDate.now();
        boolean isOverdue = task.getScheduledDate() != null && task.getScheduledDate().isBefore(today) && task.getStatus() != MaintenanceStatus.COMPLETED;
        boolean isUpcoming = task.getScheduledDate() != null && !task.getScheduledDate().isBefore(today) && task.getScheduledDate().isBefore(today.plusDays(30));

        return MaintenanceScheduleResponse.builder()
                .id(task.getId())
                .equipmentId(task.getEquipment() != null ? task.getEquipment().getId() : null)
                .equipmentName(task.getEquipment() != null ? task.getEquipment().getName() : null)
                .title(task.getTitle()).scheduledDate(task.getScheduledDate())
                .assignedTechnician(task.getAssignedTechnician())
                .priority(task.getPriority()).status(task.getStatus())
                .overdue(isOverdue).upcoming(isUpcoming).build();
    }
}