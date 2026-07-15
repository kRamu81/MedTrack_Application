package com.medtrack.controller;

import com.medtrack.model.Equipment;
import com.medtrack.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    private final EquipmentService equipmentService;

    /**
     * Retrieves all equipment records associated with the authenticated hospital.
     *
     * @param principal the authenticated user's security principal
     * @return a list of equipment records
     */
    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment(Principal principal) {
        return ResponseEntity.ok(equipmentService.getAllEquipment(principal.getName()));
    }

    /**
     * Retrieves a specific equipment record by its ID.
     *
     * @param id the equipment identifier
     * @param principal the authenticated user's security principal
     * @return the requested equipment record
     */
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id, Principal principal) {
        validateId(id);
        return ResponseEntity.ok(equipmentService.getEquipmentById(id, principal.getName()));
    }

    /**
     * Creates a new equipment record.
     *
     * @param equipment the equipment details to create
     * @param principal the authenticated user's security principal
     * @return the created equipment record
     */
    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Equipment> addEquipment(@Valid @RequestBody Equipment equipment, Principal principal) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment, principal.getName()));
    }

    /**
     * Updates an existing equipment record.
     *
     * @param id the equipment identifier
     * @param equipment the updated equipment details
     * @param principal the authenticated user's security principal
     * @return the updated equipment record
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id,
                                                     @Valid @RequestBody Equipment equipment,
                                                     Principal principal) {
        validateId(id);
        return ResponseEntity.ok(equipmentService.updateEquipment(id, equipment, principal.getName()));
    }

    /**
     * Deletes an equipment record by its ID.
     *
     * @param id the equipment identifier
     * @param principal the authenticated user's security principal
     * @return HTTP 204 No Content when the deletion is successful
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id, Principal principal) {
        validateId(id);
        equipmentService.deleteEquipment(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Imports equipment from an uploaded CSV file.
     * Accessible only to users with the HOSPITAL role.
     *
     * @param file the CSV file to import
     * @param principal the authenticated user's security principal
     * @return the import summary
     */
    @PostMapping("/import")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<com.medtrack.dto.EquipmentImportSummary> importEquipment(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(equipmentService.importEquipmentFromCsv(file, principal.getName()));
    }

    /**
     * Generates a QR Code for a specific equipment record.
     * Accessible to any authenticated user.
     *
     * @param id the equipment identifier
     * @param principal the authenticated user's security principal
     * @return a JSON object containing the base64 encoded QR Code string
     */
    @GetMapping("/{id}/qr-code")
    public ResponseEntity<java.util.Map<String, String>> getQrCode(
            @PathVariable Long id,
            Principal principal) {
        String base64Qr = equipmentService.generateQrCodeBase64(id, principal.getName());
        return ResponseEntity.ok(java.util.Map.of("qrCode", base64Qr));
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