package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.model.Hospital;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.repository.MaintenanceTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.medtrack.exception.ResourceNotFoundException;

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
    private Authentication authentication;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private User mockUser;
    private Hospital mockHospital;
    private MaintenanceTask mockTask;
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
    }

    @Test
    void scheduleTask_Success() {
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceTask taskToSchedule = MaintenanceTask.builder()
                .equipmentId("EQ-100")
                .equipment("MRI Scanner")
                .deadline(LocalDate.now())
                .build();

        MaintenanceTask result = maintenanceService.scheduleTask(taskToSchedule, authentication);

        assertNotNull(result);
        assertEquals(mockHospital.getId(), result.getHospitalId());
        assertEquals(mockHospital.getName(), result.getHospital());
        assertNotNull(result.getTaskCode());
        assertTrue(result.getTaskCode().startsWith("MNT-"));
    }

    @Test
    void updateTask_EnforcesAutoRecurrenceOnComplete() {
        when(authentication.getName()).thenReturn("tech@medtrack.com");
        when(taskRepository.findByIdAndAssignedTechnician(50L, "tech@medtrack.com"))
                .thenReturn(Optional.of(mockTask));

        // Mock saving the updated task
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MaintenanceTask taskUpdatePayload = MaintenanceTask.builder()
                .status(MaintenanceStatus.COMPLETED)
                .notes("All filters cleaned. Operational.")
                .hoursWorked(2.5)
                .partsUsed("Clean filters")
                .signature("data:image/png;base64,drawingData")
                .recurrencePeriodDays(90)
                .build();

        // Capture both saves: first the updated task, second the newly spawned recurring task
        ArgumentCaptor<MaintenanceTask> taskCaptor = ArgumentCaptor.forClass(MaintenanceTask.class);

        MaintenanceTask result = maintenanceService.updateTask(50L, taskUpdatePayload, authentication);

        assertNotNull(result);
        assertEquals(MaintenanceStatus.COMPLETED, result.getStatus());
        assertEquals("data:image/png;base64,drawingData", result.getSignature());

        // Verify save was called twice (once for completion, once for spawning the next scheduled task)
        verify(taskRepository, times(2)).save(taskCaptor.capture());

        List<MaintenanceTask> savedTasks = taskCaptor.getAllValues();
        assertEquals(2, savedTasks.size());

        MaintenanceTask completedTask = savedTasks.get(0);
        assertEquals(MaintenanceStatus.COMPLETED, completedTask.getStatus());

        MaintenanceTask nextTask = savedTasks.get(1);
        assertEquals(MaintenanceStatus.SCHEDULED, nextTask.getStatus());
        assertEquals(LocalDate.now().plusDays(90), nextTask.getDeadline());
        assertEquals("MRI Scanner", nextTask.getEquipment());
        assertEquals("tech@medtrack.com", nextTask.getAssignedTechnician());
        assertTrue(nextTask.getDescription().contains("Auto-scheduled recurring maintenance task"));
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
        when(taskRepository.findByIdAndHospitalId(50L, mockHospital.getId())).thenReturn(Optional.of(mockTask));

        maintenanceService.deleteTask(50L, authentication);

        verify(taskRepository).delete(mockTask);
    }

    @Test
    void deleteTask_NotFoundOrAccessDenied_ThrowsException() {
        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
        when(taskRepository.findByIdAndHospitalId(999L, mockHospital.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                maintenanceService.deleteTask(999L, authentication)
        );

        verify(taskRepository, never()).delete(any());
    }
}
