package com.medtrack.controller;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<MaintenanceTask> scheduleTask(@RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.scheduleTask(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable Long id, @RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        maintenanceService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
