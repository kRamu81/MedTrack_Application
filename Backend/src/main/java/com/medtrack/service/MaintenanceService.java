package com.medtrack.service;

import com.medtrack.model.MaintenanceTask;
import com.medtrack.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTaskRepository taskRepository;

    public List<MaintenanceTask> getAllTasks() {
        try {
            return taskRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch maintenance tasks", e);
        }
    }

    public MaintenanceTask getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found with id: " + id));
    }

    public MaintenanceTask scheduleTask(MaintenanceTask task) {
        try {
            if (task.getTaskCode() == null) {
                task.setTaskCode("MNT-" + System.currentTimeMillis() % 10000);
            }
            return taskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to schedule maintenance task", e);
        }
    }

    public MaintenanceTask updateTask(Long id, MaintenanceTask taskDetails) {
        try {
            MaintenanceTask task = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            task.setStatus(taskDetails.getStatus());
            task.setNotes(taskDetails.getNotes());
            task.setHoursWorked(taskDetails.getHoursWorked());
            task.setAssignedTechnician(taskDetails.getAssignedTechnician());

            return taskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update maintenance task", e);
        }
    }

    public void deleteTask(Long id) {
        try {
            taskRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete maintenance task", e);
        }
    }
}