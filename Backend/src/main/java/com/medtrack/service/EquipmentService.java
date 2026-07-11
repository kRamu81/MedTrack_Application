package com.medtrack.service;

import com.medtrack.model.Equipment;
import com.medtrack.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.medtrack.exception.ResourceNotFoundException;

import java.util.List;

/**
 * Service layer for Equipment-related business logic.
 * Handles CRUD operations for hospital equipment records.
 */
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    /**
     * Fetches all equipment records from the database.
     * Used by the "get all equipment" list view on the frontend.
     */
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    /**
     * Fetches a single equipment record by its database ID.
     * Used for equipment detail views.
     * Throws a ResourceNotFoundException if no equipment exists with the given ID.
     */
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    /**
     * Adds a new equipment record.
     * If no equipmentCode is provided by the caller, auto-generates one
     * using the last 4 digits of the current timestamp (e.g. "EQ-4821").
     */
    public Equipment addEquipment(Equipment equipment) {
        // Generate a simple code if not provided
        if (equipment.getEquipmentCode() == null) {
            equipment.setEquipmentCode("EQ-" + System.currentTimeMillis() % 10000);
        }
        return equipmentRepository.save(equipment);
    }

    /**
     * Deletes an equipment record by ID.
     */
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Equipment not found with id: " + id));

        equipmentRepository.delete(equipment);
    }

        /**
         * Updates an existing equipment record's fields.
         * Fetches the existing record first, then overwrites its fields
         * with the incoming values before saving.
         * Throws a ResourceNotFoundException if no equipment exists with the given ID.
         */
    public Equipment updateEquipment(Long id, Equipment equipmentDetails) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        equipment.setName(equipmentDetails.getName());
        equipment.setModel(equipmentDetails.getModel());
        equipment.setSerialNumber(equipmentDetails.getSerialNumber());
        equipment.setDepartment(equipmentDetails.getDepartment());
        equipment.setStatus(equipmentDetails.getStatus());
        equipment.setPurchaseDate(equipmentDetails.getPurchaseDate());

        return equipmentRepository.save(equipment);
    }
}