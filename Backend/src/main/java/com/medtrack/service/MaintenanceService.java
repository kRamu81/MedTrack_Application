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
        return taskRepository.findAll();
    }

    public MaintenanceTask scheduleTask(MaintenanceTask task) {
        if (task.getTaskCode() == null) {
            task.setTaskCode("MNT-" + System.currentTimeMillis() % 10000);
        }
        return taskRepository.save(task);
    }

    public MaintenanceTask updateTask(Long id, MaintenanceTask taskDetails) {
        MaintenanceTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(taskDetails.getStatus());
        task.setNotes(taskDetails.getNotes());
        task.setHoursSpent(taskDetails.getHoursSpent());
        task.setAssignedTechnician(taskDetails.getAssignedTechnician());
        
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
