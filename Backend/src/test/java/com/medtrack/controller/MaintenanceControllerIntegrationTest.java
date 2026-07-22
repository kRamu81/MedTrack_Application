package com.medtrack.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.service.KafkaEventPublisher;
import com.medtrack.dto.MaintenanceCreateRequest;
import com.medtrack.dto.MaintenanceUpdateRequest;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import com.medtrack.service.MaintenanceService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration",
        "security.rate-limit.capacity=1000",
        "security.rate-limit.refill-tokens=1000",
        "app.data-initializer.enabled=false"
})
// Custom JWT filters replace the test SecurityContext when no bearer token is
// present. Disabling servlet filters keeps method-security active so these
// tests exercise the controller's @PreAuthorize role guards directly.
@AutoConfigureMockMvc(addFilters = false)
class MaintenanceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MaintenanceService maintenanceService;

    @MockitoBean
    private KafkaEventPublisher kafkaEventPublisher;

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void listTasks_ReturnsEmptyJsonArrayWith200() throws Exception {
        when(maintenanceService.getAllTasks(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/maintenance"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void hospitalCanScheduleValidMaintenance() throws Exception {
        MaintenanceCreateRequest request = validSchedulingRequest();
        MaintenanceTask created = MaintenanceTask.builder()
                .id(42L)
                .taskCode("MNT-SERVER-GENERATED")
                .equipmentId(request.getEquipmentId())
                .maintenanceType(request.getMaintenanceType())
                .deadline(request.getDeadline())
                .priority(request.getPriority())
                .status(MaintenanceStatus.SCHEDULED)
                .build();

        when(maintenanceService.scheduleTask(any(MaintenanceCreateRequest.class), any())).thenReturn(created);

        mockMvc.perform(post("/api/maintenance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.taskCode").value("MNT-SERVER-GENERATED"))
                .andExpect(jsonPath("$.status").value("Scheduled"));
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void schedulingIgnoresLegacyServerControlledRequestFields() throws Exception {
        MaintenanceTask created = MaintenanceTask.builder()
                .id(42L)
                .taskCode("MNT-SERVER-GENERATED")
                .equipmentId("EQ-1001")
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(7))
                .priority("High")
                .status(MaintenanceStatus.SCHEDULED)
                .build();
        when(maintenanceService.scheduleTask(any(MaintenanceCreateRequest.class), any()))
                .thenReturn(created);

        mockMvc.perform(post("/api/maintenance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id":999,
                                  "taskCode":"CLIENT-CODE",
                                  "equipmentId":"EQ-1001",
                                  "maintenanceType":"Inspection",
                                  "deadline":"%s",
                                  "priority":"High",
                                  "status":"Completed",
                                  "completedAt":"2026-01-01T00:00:00"
                                }
                                """.formatted(LocalDate.now().plusDays(7))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.taskCode").value("MNT-SERVER-GENERATED"))
                .andExpect(jsonPath("$.status").value("Scheduled"));

        ArgumentCaptor<MaintenanceCreateRequest> requestCaptor =
                ArgumentCaptor.forClass(MaintenanceCreateRequest.class);
        verify(maintenanceService).scheduleTask(requestCaptor.capture(), any());
        assertEquals("EQ-1001", requestCaptor.getValue().getEquipmentId());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianCannotScheduleMaintenance() throws Exception {
        mockMvc.perform(post("/api/maintenance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validSchedulingRequest())))
                .andExpect(status().isForbidden());

        verify(maintenanceService, never()).scheduleTask(any(), any());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianCanUpdateMaintenance() throws Exception {
        MaintenanceUpdateRequest update = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.IN_PROGRESS)
                .notes("Inspection started")
                .hoursWorked(1.5)
                .build();
        MaintenanceTask updated = MaintenanceTask.builder()
                .id(42L)
                .taskCode("MNT-42")
                .equipmentId("EQ-1001")
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(1))
                .priority("High")
                .status(MaintenanceStatus.IN_PROGRESS)
                .notes("Inspection started")
                .hoursWorked(1.5)
                .build();

        when(maintenanceService.updateTask(eq(42L), any(MaintenanceUpdateRequest.class), any())).thenReturn(updated);

        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("In Progress"))
                .andExpect(jsonPath("$.hoursWorked").value(1.5));
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void hospitalCannotUseTechnicianUpdateEndpoint() throws Exception {
        MaintenanceUpdateRequest update = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.IN_PROGRESS)
                .build();

        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());

        verify(maintenanceService, never()).updateTask(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void hospitalCanDeleteMaintenance() throws Exception {
        mockMvc.perform(delete("/api/maintenance/42"))
                .andExpect(status().isNoContent());

        verify(maintenanceService).deleteTask(eq(42L), any());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianCannotDeleteMaintenance() throws Exception {
        mockMvc.perform(delete("/api/maintenance/42"))
                .andExpect(status().isForbidden());

        verify(maintenanceService, never()).deleteTask(any(), any());
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void invalidSchedulingPayloadReturns400() throws Exception {
        MaintenanceCreateRequest invalid = MaintenanceCreateRequest.builder()
                .equipmentId("")
                .maintenanceType("")
                .priority("Urgent")
                .build();

        mockMvc.perform(post("/api/maintenance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.equipmentId").exists())
                .andExpect(jsonPath("$.errors.maintenanceType").exists())
                .andExpect(jsonPath("$.errors.deadline").exists())
                .andExpect(jsonPath("$.errors.priority").exists());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void invalidStatusTextReturns400() throws Exception {
        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"Started","notes":"Invalid state"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianUpdateWithoutStatusReturnsValidationError() throws Exception {
        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"notes":"Inspection started"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.status").value("Status is required"));

        verify(maintenanceService, never()).updateTask(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianUpdateWithNegativeHoursReturnsValidationError() throws Exception {
        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"In Progress","hoursWorked":-1}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.hoursWorked").value("Hours worked cannot be negative"));

        verify(maintenanceService, never()).updateTask(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void invalidStatusTransitionReturns400() throws Exception {
        MaintenanceUpdateRequest update = MaintenanceUpdateRequest.builder()
                .status(MaintenanceStatus.COMPLETED)
                .build();
        when(maintenanceService.updateTask(eq(42L), any(MaintenanceUpdateRequest.class), any()))
                .thenThrow(new InvalidStatusTransitionException(
                        "Cannot change maintenance status from Scheduled to Completed"));

        mockMvc.perform(put("/api/maintenance/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Cannot change maintenance status from Scheduled to Completed"));
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void nonPositiveResourceIdReturns400() throws Exception {
        mockMvc.perform(get("/api/maintenance/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid resource ID."));

        verify(maintenanceService, never()).getTaskById(any(), any());
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void hospitalCanExportCalendar() throws Exception {
        when(maintenanceService.exportTasksToICal(any()))
                .thenReturn("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n");

        mockMvc.perform(get("/api/maintenance/export/calendar.ics"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/calendar"))
                .andExpect(content().string("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n"));
    }

    @Test
    @WithMockUser(username = "tech@medtrack.com", roles = "TECHNICIAN")
    void technicianCannotExportHospitalCalendar() throws Exception {
        mockMvc.perform(get("/api/maintenance/export/calendar.ics"))
                .andExpect(status().isForbidden());

        verify(maintenanceService, never()).exportTasksToICal(any());
    }

    @Test
    @WithMockUser(username = "hospital@medtrack.com", roles = "HOSPITAL")
    void hospitalListReturnsServiceTasks() throws Exception {
        MaintenanceTask task = MaintenanceTask.builder()
                .id(42L)
                .taskCode("MNT-42")
                .equipmentId("EQ-1001")
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(1))
                .priority("Normal")
                .status(MaintenanceStatus.SCHEDULED)
                .build();
        when(maintenanceService.getAllTasks(any())).thenReturn(List.of(task));

        mockMvc.perform(get("/api/maintenance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].taskCode").value("MNT-42"))
                .andExpect(jsonPath("$[0].status").value("Scheduled"));
    }

    private MaintenanceCreateRequest validSchedulingRequest() {
        return MaintenanceCreateRequest.builder()
                .equipmentId("EQ-1001")
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(7))
                .priority("High")
                .build();
    }
}
