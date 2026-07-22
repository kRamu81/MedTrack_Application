package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.dto.MaintenanceCreateRequest;
import com.medtrack.dto.MaintenanceUpdateRequest;
import com.medtrack.model.Hospital;
import com.medtrack.model.Equipment;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.medtrack.exception.ResourceNotFoundException;

import jakarta.persistence.LockModeType;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MaintenanceServiceTest {

    @Mock
    private MaintenanceTaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private User mockUser;
    private Hospital mockHospital;
    private MaintenanceTask mockTask;
    private Equipment mockEquipment;
    private final String email = "hospital@medtrack.com";

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email(email)
                .build();

        mockHospital = Hospital.builder()
                .id(10L)
                .name("General Hospital")
                .user(mockUser)
                .build();

        mockTask = MaintenanceTask.builder()
                .id(50L)
                .taskCode("MNT-1111")
                .equipmentId("EQ-100")
                .equipment("MRI Scanner")
                .hospital("General Hospital")
                .hospitalId(10L)
                .maintenanceType("Preventive Maintenance")
                .deadline(LocalDate.now())
                .assignedTechnician("tech@medtrack.com")
                .description("Routine checkup")
                .priority("High")
                .status(MaintenanceStatus.IN_PROGRESS)
                .recurrencePeriodDays(90)
                .build();

        mockEquipment = Equipment.builder()
                .id(100L)
                .equipmentCode("EQ-100")
                .name("MRI Scanner")
                .department("Radiology")
                .hospital(mockHospital)
                .build();
    }

    @Test
    void scheduleTask_Success() {
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(equipmentRepository.findByEquipmentCode("EQ-100")).thenReturn(Optional.of(mockEquipment));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceCreateRequest taskToSchedule = MaintenanceCreateRequest.builder()
                .equipmentId("EQ-100")
                .maintenanceType("Preventive")
                .deadline(LocalDate.now())
                .priority("Normal")
                .build();

        MaintenanceTask result = maintenanceService.scheduleTask(taskToSchedule, authentication);

        assertNotNull(result);
        assertNull(result.getId());
        assertEquals(mockHospital.getId(), result.getHospitalId());
        assertEquals(mockHospital.getName(), result.getHospital());
        assertNotNull(result.getTaskCode());
        assertTrue(result.getTaskCode().startsWith("MNT-"));
        assertSame(mockEquipment, result.getEquipmentRecord());
        assertEquals(MaintenanceStatus.SCHEDULED, result.getStatus());
        assertNull(result.getNotes());
        assertNull(result.getHoursWorked());
        assertNull(result.getCompletedAt());
    }

    @Test
    void scheduleTask_RejectsEquipmentOwnedByAnotherHospital() {
        Hospital anotherHospital = Hospital.builder().id(99L).name("Other Hospital").build();
        mockEquipment.setHospital(anotherHospital);

        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(equipmentRepository.findByEquipmentCode("EQ-100")).thenReturn(Optional.of(mockEquipment));

        MaintenanceCreateRequest request = MaintenanceCreateRequest.builder()
                .equipmentId("EQ-100")
                .maintenanceType("Preventive")
                .deadline(LocalDate.now())
                .priority("Normal")
                .build();

        assertThrows(ResourceNotFoundException.class,
                () -> maintenanceService.scheduleTask(request, authentication));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_EnforcesAutoRecurrenceOnComplete() {
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        // Mock saving the updated task
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceUpdateRequest taskUpdatePayload = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .notes("All filters cleaned. Operational.")
                .hoursWorked(2.5)
                .partsUsed("Clean filters")
                .signature("data:image/png;base64,drawingData")
                .recurrencePeriodDays(30)
                .build();

        // Capture both saves: first the updated task, second the newly spawned recurring task
        ArgumentCaptor<MaintenanceTask> taskCaptor = ArgumentCaptor.forClass(MaintenanceTask.class);

        MaintenanceTask result = maintenanceService.updateTask(50L, taskUpdatePayload, authentication);

        assertNotNull(result);
        assertEquals(MaintenanceStatus.COMPLETED, result.getStatus());
        assertEquals("data:image/png;base64,drawingData", result.getSignature());
        assertNotNull(result.getCompletedAt());

        // Verify save was called twice (once for completion, once for spawning the next scheduled task)
        verify(taskRepository, times(2)).save(taskCaptor.capture());
        verify(taskRepository).findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com");

        List<MaintenanceTask> savedTasks = taskCaptor.getAllValues();
        assertEquals(2, savedTasks.size());

        MaintenanceTask completedTask = savedTasks.get(0);
        assertEquals(MaintenanceStatus.COMPLETED, completedTask.getStatus());
        assertEquals(90, completedTask.getRecurrencePeriodDays());

        MaintenanceTask nextTask = savedTasks.get(1);
        assertEquals(MaintenanceStatus.SCHEDULED, nextTask.getStatus());
        assertEquals(LocalDate.now().plusDays(90), nextTask.getDeadline());
        assertEquals(90, nextTask.getRecurrencePeriodDays());
        assertEquals("MRI Scanner", nextTask.getEquipment());
        assertEquals("tech@medtrack.com", nextTask.getAssignedTechnician());
        assertTrue(nextTask.getDescription().contains("Auto-scheduled recurring maintenance task"));
    }

    @Test
    void updateTask_RejectsNegativeHours() {
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.IN_PROGRESS)
                .hoursWorked(-1.0)
                .build();

        assertThrows(IllegalArgumentException.class,
                () -> maintenanceService.updateTask(50L, request, authentication));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_RejectsCompletionWithoutSignature() {
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .hoursWorked(1.0)
                .build();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> maintenanceService.updateTask(50L, request, authentication));

        assertEquals("Technician signature is required to complete the task", exception.getMessage());
        assertNull(mockTask.getCompletedAt());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_CompletesWithPreviouslyStoredSignatureWhenPayloadOmitsIt() {
        mockTask.setSignature("stored-technician-signature");
        mockTask.setRecurrencePeriodDays(null);
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .build();

        MaintenanceTask result = maintenanceService.updateTask(50L, request, authentication);

        assertEquals(MaintenanceStatus.COMPLETED, result.getStatus());
        assertEquals("stored-technician-signature", result.getSignature());
        assertNotNull(result.getCompletedAt());
        verify(taskRepository).save(mockTask);
    }

    @Test
    void updateTask_RejectsExplicitBlankSignatureOnCompletion() {
        mockTask.setSignature("stored-technician-signature");
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .signature("   ")
                .build();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> maintenanceService.updateTask(50L, request, authentication));

        assertEquals("Technician signature is required to complete the task", exception.getMessage());
        assertNull(mockTask.getCompletedAt());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_RejectsInvalidStatusTransition() {
        mockTask.setStatus(MaintenanceStatus.SCHEDULED);
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .build();

        assertThrows(com.medtrack.exception.InvalidStatusTransitionException.class,
                () -> maintenanceService.updateTask(50L, request, authentication));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void updateTask_RejectsEditingCompletedTaskWithoutCreatingRecurrence() {
        mockTask.setStatus(MaintenanceStatus.COMPLETED);
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnicianForUpdate(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        MaintenanceUpdateRequest request = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .notes("Edited after completion")
                .build();

        assertThrows(com.medtrack.exception.InvalidStatusTransitionException.class,
                () -> maintenanceService.updateTask(50L, request, authentication));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void exportTasksToICal_GeneratesValidFormat() {
        // Set up auth to have ROLE_HOSPITAL
        when(authentication.getName()).thenReturn(email);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOSPITAL")))
                .when(authentication).getAuthorities();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByHospitalId(mockHospital.getId())).thenReturn(Collections.singletonList(mockTask));

        String icalResult = maintenanceService.exportTasksToICal(authentication);

        assertNotNull(icalResult);
        assertTrue(icalResult.contains("BEGIN:VCALENDAR"));
        assertTrue(icalResult.contains("PRODID:-//MedTrack//Equipment Maintenance Feed//EN"));
        assertTrue(icalResult.contains("BEGIN:VEVENT"));
        assertTrue(icalResult.contains("UID:MNT-1111@medtrack.com"));
        assertTrue(icalResult.contains("SUMMARY:MRI Scanner -"));
        assertTrue(icalResult.contains("STATUS:NEEDS-ACTION")); // since status is IN_PROGRESS
        assertTrue(icalResult.contains("END:VEVENT"));
        assertTrue(icalResult.contains("END:VCALENDAR"));
    }

    @Test
    void updateQuery_UsesPessimisticWriteLock() throws NoSuchMethodException {
        Method method = MaintenanceTaskRepository.class.getMethod(
                "findByIdAndAssignedTechnicianForUpdate", Long.class, String.class);

        Lock lock = method.getAnnotation(Lock.class);

        assertNotNull(lock);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, lock.value());
    }

    @Test
    void deleteQuery_UsesPessimisticWriteLock() throws NoSuchMethodException {
        Method method = MaintenanceTaskRepository.class.getMethod(
                "findByIdAndHospitalIdForUpdate", Long.class, Long.class);

        Lock lock = method.getAnnotation(Lock.class);

        assertNotNull(lock);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, lock.value());
    }

    @Test
    void exportTasksToICal_EscapesTextUsesUtcAndFoldsUtf8Lines() {
        mockTask.setEquipment("MRI, Scanner; East\\Wing");
        mockTask.setMaintenanceType("Inspection\r\nX-INJECTED:TRUE");
        mockTask.setDescription("Unicode 医療 ".repeat(20) + "\r\nSecond line, with; punctuation\\");

        when(authentication.getName()).thenReturn(email);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOSPITAL")))
                .when(authentication).getAuthorities();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByHospitalId(mockHospital.getId())).thenReturn(Collections.singletonList(mockTask));

        String icalResult = maintenanceService.exportTasksToICal(authentication);
        String unfoldedResult = icalResult.replace("\r\n ", "");

        assertTrue(unfoldedResult.contains("SUMMARY:MRI\\, Scanner\\; East\\\\Wing - Inspection\\nX-INJECTED:TRUE"));
        assertFalse(icalResult.contains("\r\nX-INJECTED:TRUE"));
        assertTrue(icalResult.matches("(?s).*DTSTAMP:\\d{8}T\\d{6}Z\\r\\n.*"));
        assertTrue(unfoldedResult.contains("\\nSecond line\\, with\\; punctuation\\\\"));

        for (String line : icalResult.split("\\r\\n", -1)) {
            assertTrue(line.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 75,
                    () -> "iCalendar content line exceeds 75 octets: " + line);
        }
        assertTrue(icalResult.contains("\r\n "), "Long content should use RFC 5545 continuation lines");
    }

    @Test
    void getAllTasks_HospitalScope_Success() {
        when(authentication.getName()).thenReturn(email);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOSPITAL")))
                .when(authentication).getAuthorities();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByHospitalId(mockHospital.getId())).thenReturn(Collections.singletonList(mockTask));

        List<MaintenanceTask> result = maintenanceService.getAllTasks(authentication);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("MNT-1111", result.get(0).getTaskCode());
    }

    @Test
    void getAllTasks_TechnicianScope_Success() {
        String techEmail = "tech@medtrack.com";
        when(authentication.getName()).thenReturn(techEmail);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_TECHNICIAN")))
                .when(authentication).getAuthorities();

        when(taskRepository.findByAssignedTechnician(techEmail)).thenReturn(Collections.singletonList(mockTask));

        List<MaintenanceTask> result = maintenanceService.getAllTasks(authentication);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("MNT-1111", result.get(0).getTaskCode());
    }

    @Test
    void deleteTask_Success() {
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByIdAndHospitalIdForUpdate(50L, mockHospital.getId()))
                .thenReturn(Optional.of(mockTask));

        maintenanceService.deleteTask(50L, authentication);

        verify(taskRepository).delete(mockTask);
    }

    @Test
    void deleteTask_NotFoundOrAccessDenied_ThrowsException() {
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByIdAndHospitalIdForUpdate(999L, mockHospital.getId()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                maintenanceService.deleteTask(999L, authentication)
        );

        verify(taskRepository, never()).delete(any());
    }

    @Test
    void deleteTask_RejectsCompletedMaintenanceEvidence() {
        mockTask.setStatus(MaintenanceStatus.COMPLETED);
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByIdAndHospitalIdForUpdate(50L, mockHospital.getId()))
                .thenReturn(Optional.of(mockTask));

        assertThrows(com.medtrack.exception.InvalidStatusTransitionException.class,
                () -> maintenanceService.deleteTask(50L, authentication));

        verify(taskRepository, never()).delete(any());
    }
}
