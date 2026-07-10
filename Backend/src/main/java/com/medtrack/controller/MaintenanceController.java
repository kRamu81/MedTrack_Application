package com.medtrack.controller;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<MaintenanceTask>> getAllTasks() {
        return ResponseEntity.ok(maintenanceService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTask> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getTaskById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<MaintenanceTask> scheduleTask(@RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.scheduleTask(task));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable Long id, @RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        maintenanceService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
