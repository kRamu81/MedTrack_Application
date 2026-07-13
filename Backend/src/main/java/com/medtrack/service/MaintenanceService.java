package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.model.Hospital;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.medtrack.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;

    public List<MaintenanceTask> getAllTasks(Authentication authentication) {
        // Scope lists from the trusted JWT identity instead of a client-supplied filter.
        if (hasRole(authentication, "HOSPITAL")) {
            return taskRepository.findByHospitalId(getHospitalForUser(authentication.getName()).getId());
        }
        if (hasRole(authentication, "TECHNICIAN")) {
            return taskRepository.findByAssignedTechnician(authentication.getName());
        }
        throw new AccessDeniedException("This role cannot access maintenance tasks");
    }

    public MaintenanceTask getTaskById(Long id, Authentication authentication) {
        return findOwnedTask(id, authentication);
    }

    public MaintenanceTask scheduleTask(MaintenanceTask task, Authentication authentication) {
        Hospital hospital = getHospitalForUser(authentication.getName());

        // Derive ownership on the server; request JSON cannot select another hospital.
        task.setHospitalId(hospital.getId());
        task.setHospital(hospital.getName());
        if (task.getTaskCode() == null) {
            task.setTaskCode("MNT-" + java.util.UUID.randomUUID().toString());
        }
        return taskRepository.save(task);
    }

    public MaintenanceTask updateTask(Long id, MaintenanceTask taskDetails, Authentication authentication) {
        // A technician can update only a task explicitly assigned to their login email.
        MaintenanceTask task = taskRepository.findByIdAndAssignedTechnician(id, authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance task not found or not assigned to you"));

        task.setStatus(taskDetails.getStatus());
        task.setNotes(taskDetails.getNotes());
        task.setHoursWorked(taskDetails.getHoursWorked());
        task.setPartsUsed(taskDetails.getPartsUsed());
        task.setSignature(taskDetails.getSignature());
        if (taskDetails.getRecurrencePeriodDays() != null) {
            task.setRecurrencePeriodDays(taskDetails.getRecurrencePeriodDays());
        }

        MaintenanceTask savedTask = taskRepository.save(task);

        // If the task transitioned to Completed and has a recurrence period, spawn the next task
        if (savedTask.getStatus() == com.medtrack.model.MaintenanceStatus.COMPLETED
                && savedTask.getRecurrencePeriodDays() != null
                && savedTask.getRecurrencePeriodDays() > 0) {

            MaintenanceTask nextTask = MaintenanceTask.builder()
                    .taskCode("MNT-" + java.util.UUID.randomUUID().toString())
                    .equipmentId(savedTask.getEquipmentId())
                    .equipment(savedTask.getEquipment())
                    .hospital(savedTask.getHospital())
                    .hospitalId(savedTask.getHospitalId())
                    .maintenanceType(savedTask.getMaintenanceType() != null ? savedTask.getMaintenanceType() : "Recurring Preventive Maintenance")
                    .deadline(java.time.LocalDate.now().plusDays(savedTask.getRecurrencePeriodDays()))
                    .assignedTechnician(savedTask.getAssignedTechnician())
                    .description("Auto-scheduled recurring maintenance task based on completion of task: " + savedTask.getTaskCode())
                    .priority(savedTask.getPriority())
                    .status(com.medtrack.model.MaintenanceStatus.SCHEDULED)
                    .recurrencePeriodDays(savedTask.getRecurrencePeriodDays())
                    .build();

            taskRepository.save(nextTask);
        }

        return savedTask;
    }

    public String exportTasksToICal(Authentication authentication) {
        List<MaintenanceTask> tasks = getAllTasks(authentication);
        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\r\n")
                .append("VERSION:2.0\r\n")
                .append("PRODID:-//MedTrack//Equipment Maintenance Feed//EN\r\n")
                .append("CALSCALE:GREGORIAN\r\n")
                .append("METHOD:PUBLISH\r\n");

        java.time.format.DateTimeFormatter basicDate = java.time.format.DateTimeFormatter.BASIC_ISO_DATE;
        java.time.format.DateTimeFormatter stampTime = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        String nowStamp = java.time.LocalDateTime.now().format(stampTime);

        for (MaintenanceTask task : tasks) {
            if (task.getDeadline() == null) {
                continue;
            }
            String dtStart = task.getDeadline().format(basicDate);
            String dtEnd = task.getDeadline().plusDays(1).format(basicDate);
            String summary = (task.getEquipment() != null ? task.getEquipment() : "Equipment") + " - " + (task.getMaintenanceType() != null ? task.getMaintenanceType() : "Maintenance");
            String status = task.getStatus() == com.medtrack.model.MaintenanceStatus.COMPLETED ? "COMPLETED" : "NEEDS-ACTION";

            String description = String.format("Task Code: %s\\nStatus: %s\\nTechnician: %s\\nPriority: %s\\nDescription: %s",
                    task.getTaskCode(),
                    task.getStatus().getDisplayName(),
                    task.getAssignedTechnician() != null ? task.getAssignedTechnician() : "Unassigned",
                    task.getPriority() != null ? task.getPriority() : "Normal",
                    task.getDescription() != null ? task.getDescription().replace("\n", "\\n").replace("\r", "") : "");

            ical.append("BEGIN:VEVENT\r\n")
                    .append("UID:").append(task.getTaskCode() != null ? task.getTaskCode() : "task-" + task.getId()).append("@medtrack.com\r\n")
                    .append("DTSTAMP:").append(nowStamp).append("\r\n")
                    .append("DTSTART;VALUE=DATE:").append(dtStart).append("\r\n")
                    .append("DTEND;VALUE=DATE:").append(dtEnd).append("\r\n")
                    .append("SUMMARY:").append(summary).append("\r\n")
                    .append("DESCRIPTION:").append(description).append("\r\n")
                    .append("STATUS:").append(status).append("\r\n")
                    .append("END:VEVENT\r\n");
        }

        ical.append("END:VCALENDAR\r\n");
        return ical.toString();
    }

    public void deleteTask(Long id, Authentication authentication) {
        // Hospital deletion is ownership-scoped to stop cross-hospital ID access.
        MaintenanceTask task = taskRepository.findByIdAndHospitalId(
                        id, getHospitalForUser(authentication.getName()).getId())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance task not found or access denied"));
        taskRepository.delete(task);
    }

    private MaintenanceTask findOwnedTask(Long id, Authentication authentication) {
        if (hasRole(authentication, "HOSPITAL")) {
            return taskRepository.findByIdAndHospitalId(id, getHospitalForUser(authentication.getName()).getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Maintenance task not found or access denied"));
        }
        if (hasRole(authentication, "TECHNICIAN")) {
            return taskRepository.findByIdAndAssignedTechnician(id, authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Maintenance task not found or not assigned to you"));
        }
        throw new AccessDeniedException("This role cannot access maintenance tasks");
    }

    private Hospital getHospitalForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return hospitalRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found"));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}
