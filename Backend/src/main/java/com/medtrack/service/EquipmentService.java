package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.model.Equipment;
import com.medtrack.model.Hospital;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.HospitalRepository;
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
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    private Hospital getHospitalForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return hospitalRepository.findByUserId(user.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found for user"));
    }

    /**
     * Fetches all equipment records from the database.
     * Used by the "get all equipment" list view on the frontend.
     */
    public List<Equipment> getAllEquipment(String username) {
        Hospital hospital = getHospitalForUser(username);
        return equipmentRepository.findByHospitalId(hospital.getId());
    }

    /**
     * Fetches a single equipment record by its database ID.
     * Used for equipment detail views.
     * Throws a ResourceNotFoundException if no equipment exists with the given ID.
     */
    public Equipment getEquipmentById(Long id , String username) {
        Hospital hospital = getHospitalForUser(username);
        return equipmentRepository.findByIdAndHospitalId(id,hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found or you don't have access"));
    }

    /**
     * Adds a new equipment record.
     * If no equipmentCode is provided by the caller, auto-generates one
     * using the last 4 digits of the current timestamp (e.g. "EQ-4821").
     */
    public Equipment addEquipment(Equipment equipment , String username) {
        Hospital hospital = getHospitalForUser(username);
        equipment.setHospital(hospital);

        // Generate a simple code if not provided
        if (equipment.getEquipmentCode() == null) {
            equipment.setEquipmentCode("EQ-" + java.util.UUID.randomUUID().toString());
        }
        return equipmentRepository.save(equipment);
    }

    /**
     * Deletes an equipment record by ID.
     */
    public void deleteEquipment(Long id , String username) {
        Hospital hospital = getHospitalForUser(username);
        Equipment equipment = equipmentRepository.findByIdAndHospitalId(id,hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found or you don't have access"));
        equipmentRepository.delete(equipment);
    }

    /**
     * Updates an existing equipment record's fields.
     * Fetches the existing record first, then overwrites its fields
     * with the incoming values before saving.
     * Throws a ResourceNotFoundException if no equipment exists with the given ID.
     */
    public Equipment updateEquipment(Long id, Equipment equipmentDetails , String username) {
        Hospital hospital = getHospitalForUser(username);
        Equipment equipment = equipmentRepository.findByIdAndHospitalId(id,hospital.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found or you don't have access"));

        equipment.setName(equipmentDetails.getName());
        equipment.setModel(equipmentDetails.getModel());
        equipment.setSerialNumber(equipmentDetails.getSerialNumber());
        equipment.setDepartment(equipmentDetails.getDepartment());
        equipment.setStatus(equipmentDetails.getStatus());
        equipment.setPurchaseDate(equipmentDetails.getPurchaseDate());

        return equipmentRepository.save(equipment);
    }
}