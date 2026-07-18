package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.model.Equipment;
import com.medtrack.model.Hospital;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.medtrack.exception.ResourceNotFoundException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private static final int ICAL_MAX_LINE_OCTETS = 75;
    private static final DateTimeFormatter ICAL_UTC_TIMESTAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final EquipmentRepository equipmentRepository;

    // The lifecycle is centralized here so every update path follows the same rules.
    private static final Map<MaintenanceStatus, Set<MaintenanceStatus>> ALLOWED_TRANSITIONS = Map.of(
            MaintenanceStatus.SCHEDULED, EnumSet.of(MaintenanceStatus.IN_PROGRESS),
            MaintenanceStatus.IN_PROGRESS, EnumSet.of(
                    MaintenanceStatus.NEEDS_PART,
                    MaintenanceStatus.ON_HOLD,
                    MaintenanceStatus.COMPLETED),
            MaintenanceStatus.NEEDS_PART, EnumSet.of(MaintenanceStatus.IN_PROGRESS),
            MaintenanceStatus.ON_HOLD, EnumSet.of(MaintenanceStatus.IN_PROGRESS),
            MaintenanceStatus.COMPLETED, EnumSet.noneOf(MaintenanceStatus.class)
    );

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

    @Transactional
    public MaintenanceTask scheduleTask(MaintenanceTask task, Authentication authentication) {
        Hospital hospital = getHospitalForUser(authentication.getName());
        validateSchedulingRequest(task);
        Equipment equipment = resolveOwnedEquipment(task.getEquipmentId(), hospital.getId());
        validateAssignedTechnician(task.getAssignedTechnician());

        // Reset identity and report fields so POST cannot overwrite an existing task or forge its state.
        task.setId(null);
        task.setTaskCode("MNT-" + UUID.randomUUID());
        task.setHospitalId(hospital.getId());
        task.setHospital(hospital.getName());
        task.setEquipmentRecord(equipment);
        task.setEquipmentId(equipment.getEquipmentCode());
        task.setEquipment(equipment.getName());
        task.setStatus(MaintenanceStatus.SCHEDULED);
        task.setNotes(null);
        task.setHoursWorked(null);
        task.setPartsUsed(null);
        task.setSignature(null);
        task.setCompletedAt(null);
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Transactional
    public MaintenanceTask updateTask(Long id, MaintenanceTask taskDetails, Authentication authentication) {
        // A technician can update only a task explicitly assigned to their login email.
        MaintenanceTask task = taskRepository.findByIdAndAssignedTechnicianForUpdate(id, authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance task not found or not assigned to you"));

        MaintenanceStatus previousStatus = task.getStatus();
        validateTechnicianUpdate(task, taskDetails);

        task.setStatus(taskDetails.getStatus());
        task.setNotes(taskDetails.getNotes());
        task.setHoursWorked(taskDetails.getHoursWorked());
        task.setPartsUsed(taskDetails.getPartsUsed());
        task.setSignature(taskDetails.getSignature());
        if (previousStatus != MaintenanceStatus.COMPLETED
                && taskDetails.getStatus() == MaintenanceStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        }
        if (taskDetails.getRecurrencePeriodDays() != null) {
            task.setRecurrencePeriodDays(taskDetails.getRecurrencePeriodDays());
        }

        MaintenanceTask savedTask = taskRepository.save(task);

        // Generate recurrence only on the transition into COMPLETED, never on repeated saves.
        if (previousStatus != MaintenanceStatus.COMPLETED
                && savedTask.getStatus() == MaintenanceStatus.COMPLETED
                && savedTask.getRecurrencePeriodDays() != null
                && savedTask.getRecurrencePeriodDays() > 0) {

            MaintenanceTask nextTask = MaintenanceTask.builder()
                    .taskCode("MNT-" + UUID.randomUUID())
                    .equipmentId(savedTask.getEquipmentId())
                    .equipment(savedTask.getEquipment())
                    .equipmentRecord(savedTask.getEquipmentRecord())
                    .hospital(savedTask.getHospital())
                    .hospitalId(savedTask.getHospitalId())
                    .maintenanceType(savedTask.getMaintenanceType() != null ? savedTask.getMaintenanceType() : "Recurring Preventive Maintenance")
                    .deadline(java.time.LocalDate.now().plusDays(savedTask.getRecurrencePeriodDays()))
                    .assignedTechnician(savedTask.getAssignedTechnician())
                    .description("Auto-scheduled recurring maintenance task based on completion of task: " + savedTask.getTaskCode())
                    .priority(savedTask.getPriority())
                    .status(MaintenanceStatus.SCHEDULED)
                    .recurrencePeriodDays(savedTask.getRecurrencePeriodDays())
                    .build();

            taskRepository.save(nextTask);
        }

        return savedTask;
    }

    private void validateSchedulingRequest(MaintenanceTask task) {
        if (task.getEquipmentId() == null || task.getEquipmentId().isBlank()) {
            throw new IllegalArgumentException("Equipment ID is required");
        }
        if (task.getDeadline() == null) {
            throw new IllegalArgumentException("Deadline is required");
        }
        if (task.getMaintenanceType() == null || task.getMaintenanceType().isBlank()) {
            throw new IllegalArgumentException("Maintenance type is required");
        }
        if (!Set.of("Normal", "High", "Critical").contains(task.getPriority())) {
            throw new IllegalArgumentException("Priority must be Normal, High, or Critical");
        }
        if (task.getRecurrencePeriodDays() != null && task.getRecurrencePeriodDays() < 0) {
            throw new IllegalArgumentException("Recurrence period cannot be negative");
        }
    }

    private Equipment resolveOwnedEquipment(String equipmentReference, Long hospitalId) {
        // Prefer the stable equipment code, while accepting the numeric ID used by the current UI.
        // If a code exists but belongs to another hospital, do not reinterpret that code as a
        // database ID because it could resolve to an unrelated asset.
        Optional<Equipment> equipmentByCode = equipmentRepository.findByEquipmentCode(equipmentReference);
        Equipment equipment;
        if (equipmentByCode.isPresent()) {
            equipment = equipmentByCode.get();
            if (equipment.getHospital() == null || !hospitalId.equals(equipment.getHospital().getId())) {
                throw new ResourceNotFoundException("Equipment not found or does not belong to your hospital");
            }
        } else {
            equipment = resolveOwnedEquipmentByNumericId(equipmentReference, hospitalId);
        }

        if (equipment.getEquipmentCode() == null || equipment.getEquipmentCode().isBlank()) {
            throw new IllegalArgumentException("Selected equipment does not have an equipment code");
        }
        return equipment;
    }

    private Equipment resolveOwnedEquipmentByNumericId(String equipmentReference, Long hospitalId) {
        try {
            return equipmentRepository.findByIdAndHospitalId(Long.valueOf(equipmentReference), hospitalId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Equipment not found or does not belong to your hospital"));
        } catch (NumberFormatException exception) {
            throw new ResourceNotFoundException("Equipment not found or does not belong to your hospital");
        }
    }

    private void validateAssignedTechnician(String assignedTechnician) {
        if (assignedTechnician == null || assignedTechnician.isBlank()) {
            return;
        }
        User technician = userRepository.findByEmail(assignedTechnician)
                .orElseThrow(() -> new IllegalArgumentException("Assigned technician account does not exist"));
        if (!"technician".equalsIgnoreCase(technician.getRole())) {
            throw new IllegalArgumentException("Assigned user must have the technician role");
        }
    }

    private void validateTechnicianUpdate(MaintenanceTask task, MaintenanceTask taskDetails) {
        MaintenanceStatus currentStatus = task.getStatus();
        MaintenanceStatus requestedStatus = taskDetails.getStatus();

        if (currentStatus == null) {
            throw new InvalidStatusTransitionException("Maintenance task has no current status");
        }
        if (currentStatus == MaintenanceStatus.COMPLETED) {
            throw new InvalidStatusTransitionException("Completed maintenance tasks cannot be edited");
        }
        if (requestedStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (requestedStatus != currentStatus
                && !ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(requestedStatus)) {
            throw new InvalidStatusTransitionException(
                    "Cannot change maintenance status from " + currentStatus.getDisplayName()
                            + " to " + requestedStatus.getDisplayName());
        }
        if (requestedStatus == MaintenanceStatus.COMPLETED
                && (taskDetails.getSignature() == null || taskDetails.getSignature().isBlank())) {
            throw new IllegalArgumentException("Technician signature is required to complete the task");
        }
        if (taskDetails.getHoursWorked() != null && taskDetails.getHoursWorked() < 0) {
            throw new IllegalArgumentException("Hours worked cannot be negative");
        }
        if (taskDetails.getRecurrencePeriodDays() != null && taskDetails.getRecurrencePeriodDays() < 0) {
            throw new IllegalArgumentException("Recurrence period cannot be negative");
        }
    }

    public String exportTasksToICal(Authentication authentication) {
        List<MaintenanceTask> tasks = getAllTasks(authentication);
        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\r\n")
                .append("VERSION:2.0\r\n")
                .append("PRODID:-//MedTrack//Equipment Maintenance Feed//EN\r\n")
                .append("CALSCALE:GREGORIAN\r\n")
                .append("METHOD:PUBLISH\r\n");

        DateTimeFormatter basicDate = DateTimeFormatter.BASIC_ISO_DATE;
        String nowStamp = ICAL_UTC_TIMESTAMP.format(Instant.now());

        for (MaintenanceTask task : tasks) {
            if (task.getDeadline() == null) {
                continue;
            }
            String dtStart = task.getDeadline().format(basicDate);
            String dtEnd = task.getDeadline().plusDays(1).format(basicDate);
            String summary = (task.getEquipment() != null ? task.getEquipment() : "Equipment") + " - " + (task.getMaintenanceType() != null ? task.getMaintenanceType() : "Maintenance");
            String status = task.getStatus() == com.medtrack.model.MaintenanceStatus.COMPLETED ? "COMPLETED" : "NEEDS-ACTION";

            String description = String.format("Task Code: %s\nStatus: %s\nTechnician: %s\nPriority: %s\nDescription: %s",
                    task.getTaskCode(),
                    task.getStatus().getDisplayName(),
                    task.getAssignedTechnician() != null ? task.getAssignedTechnician() : "Unassigned",
                    task.getPriority() != null ? task.getPriority() : "Normal",
                    task.getDescription() != null ? task.getDescription() : "");

            appendICalLine(ical, "BEGIN:VEVENT");
            appendICalLine(ical, "UID:"
                    + (task.getTaskCode() != null ? task.getTaskCode() : "task-" + task.getId())
                    + "@medtrack.com");
            appendICalLine(ical, "DTSTAMP:" + nowStamp);
            appendICalLine(ical, "DTSTART;VALUE=DATE:" + dtStart);
            appendICalLine(ical, "DTEND;VALUE=DATE:" + dtEnd);
            appendICalLine(ical, "SUMMARY:" + escapeICalText(summary));
            appendICalLine(ical, "DESCRIPTION:" + escapeICalText(description));
            appendICalLine(ical, "STATUS:" + status);
            appendICalLine(ical, "END:VEVENT");
        }

        ical.append("END:VCALENDAR\r\n");
        return ical.toString();
    }

    private String escapeICalText(String value) {
        return value.replace("\\", "\\\\")
                .replace("\r\n", "\\n")
                .replace("\n", "\\n")
                .replace("\r", "\\n")
                .replace(";", "\\;")
                .replace(",", "\\,");
    }

    private void appendICalLine(StringBuilder ical, String contentLine) {
        int start = 0;
        int currentOctets = 0;
        boolean continuation = false;

        for (int offset = 0; offset < contentLine.length();) {
            int codePoint = contentLine.codePointAt(offset);
            int charCount = Character.charCount(codePoint);
            int codePointOctets = new String(Character.toChars(codePoint))
                    .getBytes(StandardCharsets.UTF_8).length;
            int maxOctets = continuation ? ICAL_MAX_LINE_OCTETS - 1 : ICAL_MAX_LINE_OCTETS;

            if (currentOctets + codePointOctets > maxOctets) {
                ical.append(contentLine, start, offset).append("\r\n ");
                start = offset;
                currentOctets = 0;
                continuation = true;
            }

            currentOctets += codePointOctets;
            offset += charCount;
        }

        ical.append(contentLine, start, contentLine.length()).append("\r\n");
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
