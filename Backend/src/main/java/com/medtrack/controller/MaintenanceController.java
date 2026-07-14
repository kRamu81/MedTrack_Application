package com.medtrack.controller;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing equipment maintenance tasks.
 * Provides endpoints to create, retrieve, update, and delete
 * maintenance records.
 */
@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    /**
     * Retrieves all maintenance tasks.
     *
     * @return a list of maintenance tasks if available,
     *         or HTTP 204 No Content when no tasks exist
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('HOSPITAL', 'TECHNICIAN')")
    public ResponseEntity<List<MaintenanceTask>> getAllTasks(Authentication authentication) {
        // Forward the trusted identity so the service can enforce record ownership.
        List<MaintenanceTask> tasks = maintenanceService.getAllTasks(authentication);

        if (tasks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(tasks);
    }

    /**
     * Retrieves a maintenance task by its unique identifier.
     *
     * @param id the maintenance task identifier
     * @return the requested maintenance task
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'TECHNICIAN')")
    public ResponseEntity<MaintenanceTask> getTaskById(@PathVariable Long id,
                                                       Authentication authentication) {
        validateId(id);
        return ResponseEntity.ok(maintenanceService.getTaskById(id, authentication));
    }

    /**
     * Schedules a new maintenance task.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param task the maintenance task to be created
     * @return the newly created maintenance task with HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<MaintenanceTask> scheduleTask(@RequestBody MaintenanceTask task,
                                                        Authentication authentication) {
        MaintenanceTask createdTask = maintenanceService.scheduleTask(task, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * Updates an existing maintenance task.
     * Accessible only to users with the TECHNICIAN role.
     *
     * @param id the maintenance task identifier
     * @param task the updated maintenance task details
     * @return the updated maintenance task
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable Long id,
                                                      @RequestBody MaintenanceTask task,
                                                      Authentication authentication) {
        validateId(id);
        return ResponseEntity.ok(maintenanceService.updateTask(id, task, authentication));
    }

    /**
     * Deletes a maintenance task by its identifier.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param id the maintenance task identifier
     * @return HTTP 204 No Content when the task is successfully deleted
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           Authentication authentication) {
        validateId(id);
        maintenanceService.deleteTask(id, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * Exports all maintenance tasks for the logged-in hospital in RFC-5545 iCalendar format.
     * Accessible only to users with the HOSPITAL role.
     *
     * @return the raw calendar feed content (.ics)
     */
    @GetMapping("/export/calendar.ics")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<String> exportCalendar(Authentication authentication) {
        String icalFeed = maintenanceService.exportTasksToICal(authentication);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/calendar; charset=utf-8")
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"maintenance.ics\"")
                .body(icalFeed);
    }

    /**
     * Validates that a resource ID is a positive number.
     *
     * @param id the resource identifier
     * @throws IllegalArgumentException if the ID is less than or equal to zero
     */
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid resource ID.");
        }
    }
}
