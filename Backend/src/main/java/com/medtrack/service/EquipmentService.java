package com.medtrack.service;

import com.medtrack.model.Equipment;
import com.medtrack.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment addEquipment(Equipment equipment) {
        // Generate a simple code if not provided
        if (equipment.getEquipmentCode() == null) {
            equipment.setEquipmentCode("EQ-" + System.currentTimeMillis() % 10000);
        }
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }

    public Equipment updateEquipment(Long id, Equipment equipmentDetails) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        
        equipment.setName(equipmentDetails.getName());
        equipment.setModel(equipmentDetails.getModel());
        equipment.setSerialNumber(equipmentDetails.getSerialNumber());
        equipment.setDepartment(equipmentDetails.getDepartment());
        equipment.setStatus(equipmentDetails.getStatus());
        equipment.setPurchaseDate(equipmentDetails.getPurchaseDate());
        
        return equipmentRepository.save(equipment);
    }
}
