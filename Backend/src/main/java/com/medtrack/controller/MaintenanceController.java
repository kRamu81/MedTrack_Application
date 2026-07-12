package com.medtrack.controller;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller exposing REST endpoints for managing equipment maintenance workflows.
 * Mapped under "/api/maintenance" to schedule, track, and update maintenance requests.
 */
@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    /**
     * Retrieves a list of all maintenance tasks registered in the platform.
     */
    @GetMapping
    public ResponseEntity<List<MaintenanceTask>> getAllTasks() {
        return ResponseEntity.ok(maintenanceService.getAllTasks());
    }

    /**
     * Resolves a single maintenance task by its unique database identifier.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTask> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getTaskById(id));
    }

    /**
     * Schedules a new maintenance task for a piece of equipment.
     * Restricted to authenticated users holding the 'HOSPITAL' role authority.
     */
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<MaintenanceTask> scheduleTask(@RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.scheduleTask(task));
    }

    /**
     * Updates an existing maintenance task's status or details.
     * Restricted to authenticated users holding the 'TECHNICIAN' role authority.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable Long id, @RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.updateTask(id, task));
    }

    /**
     * Removes a scheduled maintenance task from the database.
     * Restricted to authenticated users holding the 'HOSPITAL' role authority.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        maintenanceService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
