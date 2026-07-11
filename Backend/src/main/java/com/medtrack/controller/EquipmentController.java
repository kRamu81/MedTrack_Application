package com.medtrack.controller;

import com.medtrack.model.Equipment;
import com.medtrack.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment(Principal principal) {
        return ResponseEntity.ok(equipmentService.getAllEquipment(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id , Principal principal) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id,principal.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Equipment> addEquipment(@Valid @RequestBody Equipment equipment , Principal principal) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @Valid @RequestBody Equipment equipment, Principal principal) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, equipment , principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id , Principal principal) {
        equipmentService.deleteEquipment(id,principal.getName());
        return ResponseEntity.noContent().build();
    }
}