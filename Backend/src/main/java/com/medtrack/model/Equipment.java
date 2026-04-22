package com.medtrack.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Equipment Entity - Matches frontend EquipmentList.jsx, AddEquipmentForm.jsx
 * API: GET  /api/equipment       - List all
 * API: GET  /api/equipment/{id}  - Get by ID
 * API: POST /api/equipment       - Add new
 * API: PUT  /api/equipment/{id}  - Update
 * API: DELETE /api/equipment/{id} - Delete
 */
@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Displayed as "EQ-001" style in frontend.
     * equipmentCode stores the string ID like "EQ-001"
     */
    @Column(unique = true)
    private String equipmentCode;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String model;

    private String serialNumber;

    @NotBlank
    @Column(nullable = false)
    private String department;

    /**
     * Status values: "Operational", "Maintenance", "Retired"
     * Matches AddEquipmentForm.jsx options
     */
    @Builder.Default
    private String status = "Operational";

    private String category;

    private LocalDate purchaseDate;
}
