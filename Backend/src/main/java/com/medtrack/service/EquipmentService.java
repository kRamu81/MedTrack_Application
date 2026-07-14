package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.dto.EquipmentImportSummary;
import com.medtrack.model.Equipment;
import com.medtrack.model.Hospital;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.medtrack.exception.ResourceNotFoundException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for Equipment-related business logic.
 * Handles CRUD operations, CSV bulk uploads, and asset QR code generation.
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
     * using a unique UUID.
     */
    public Equipment addEquipment(Equipment equipment , String username) {
        Hospital hospital = getHospitalForUser(username);
        equipment.setHospital(hospital);

        // Generate a simple code if not provided
        if (equipment.getEquipmentCode() == null) {
            equipment.setEquipmentCode("EQ-" + UUID.randomUUID().toString());
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

    /**
     * Generates a 250x250 base64 encoded PNG QR code for the specified equipment.
     * Encodes essential asset tracking details.
     */
    public String generateQrCodeBase64(Long id, String username) {
        Equipment equipment = getEquipmentById(id, username);
        String qrContent = String.format("MedTrack Asset:\nID: %d\nCode: %s\nName: %s\nSN: %s\nDept: %s",
                equipment.getId(),
                equipment.getEquipmentCode(),
                equipment.getName(),
                equipment.getSerialNumber() != null ? equipment.getSerialNumber() : "N/A",
                equipment.getDepartment());

        try {
            com.google.zxing.qrcode.QRCodeWriter qrCodeWriter = new com.google.zxing.qrcode.QRCodeWriter();
            com.google.zxing.common.BitMatrix bitMatrix = qrCodeWriter.encode(
                    qrContent,
                    com.google.zxing.BarcodeFormat.QR_CODE,
                    250,
                    250
            );

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            com.google.zxing.client.j2se.MatrixToImageWriter.writeToStream(
                    bitMatrix,
                    "PNG",
                    pngOutputStream
            );
            byte[] pngData = pngOutputStream.toByteArray();
            return java.util.Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code for equipment ID: " + id, e);
        }
    }

    /**
     * Imports multiple equipment items from a CSV upload.
     * Performs row-by-row validation and commits all valid rows in a batch transaction.
     */
    @Transactional
    public EquipmentImportSummary importEquipmentFromCsv(MultipartFile file, String username) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty or missing");
        }

        Hospital hospital = getHospitalForUser(username);

        List<Equipment> equipmentToSave = new ArrayList<>();
        List<EquipmentImportSummary.RowFailure> failures = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV file has no content");
            }

            List<String> headers = parseCsvLine(headerLine);
            if (headers.size() < 4) {
                throw new IllegalArgumentException("CSV file must contain at least: Name, Department, Category, Status");
            }

            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) {
                    continue;
                }

                List<String> fields = parseCsvLine(line);
                if (fields.size() < headers.size()) {
                    failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Row has fewer columns than headers"));
                    failureCount++;
                    continue;
                }

                String name = getFieldValue(fields, headers, "Name");
                String model = getFieldValue(fields, headers, "Model");
                String serialNumber = getFieldValue(fields, headers, "Serial Number");
                String department = getFieldValue(fields, headers, "Department");
                String category = getFieldValue(fields, headers, "Category");
                String status = getFieldValue(fields, headers, "Status");
                String purchaseDateStr = getFieldValue(fields, headers, "Purchase Date");

                if (name == null || name.trim().isEmpty()) {
                    failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Asset Name is required"));
                    failureCount++;
                    continue;
                }

                if (department == null || department.trim().isEmpty()) {
                    failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Department is required"));
                    failureCount++;
                    continue;
                }

                if (category == null || category.trim().isEmpty()) {
                    category = "Imaging";
                } else {
                    List<String> validCategories = List.of("Imaging", "Surgical", "Monitoring", "Laboratory", "Respiratory");
                    String finalCat = category.trim();
                    if (validCategories.stream().noneMatch(c -> c.equalsIgnoreCase(finalCat))) {
                        failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Invalid category. Allowed: Imaging, Surgical, Monitoring, Laboratory, Respiratory"));
                        failureCount++;
                        continue;
                    }
                    category = validCategories.stream().filter(c -> c.equalsIgnoreCase(finalCat)).findFirst().orElse(category);
                }

                if (status == null || status.trim().isEmpty()) {
                    status = "Operational";
                } else {
                    List<String> validStatuses = List.of("Operational", "Maintenance", "Retired");
                    String finalStatus = status.trim();
                    if (validStatuses.stream().noneMatch(s -> s.equalsIgnoreCase(finalStatus))) {
                        failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Invalid condition/status. Allowed: Operational, Maintenance, Retired"));
                        failureCount++;
                        continue;
                    }
                    status = validStatuses.stream().filter(s -> s.equalsIgnoreCase(finalStatus)).findFirst().orElse(status);
                }

                LocalDate purchaseDate = null;
                if (purchaseDateStr != null && !purchaseDateStr.trim().isEmpty()) {
                    try {
                        purchaseDate = LocalDate.parse(purchaseDateStr.trim());
                    } catch (DateTimeParseException e) {
                        failures.add(new EquipmentImportSummary.RowFailure(rowNum, line, "Invalid Purchase Date format. Expected YYYY-MM-DD"));
                        failureCount++;
                        continue;
                    }
                }

                Equipment equipment = Equipment.builder()
                        .name(name)
                        .model(model)
                        .serialNumber(serialNumber)
                        .department(department)
                        .category(category)
                        .status(status)
                        .purchaseDate(purchaseDate)
                        .equipmentCode("EQ-" + UUID.randomUUID().toString())
                        .hospital(hospital)
                        .build();

                equipmentToSave.add(equipment);
                successCount++;
            }

            if (!equipmentToSave.isEmpty()) {
                equipmentRepository.saveAll(equipmentToSave);
            }

        } catch (Exception e) {
            throw new RuntimeException("Error reading CSV file", e);
        }

        return EquipmentImportSummary.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .failures(failures)
                .build();
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder currentToken = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(currentToken.toString().trim());
                currentToken.setLength(0);
            } else {
                currentToken.append(c);
            }
        }
        result.add(currentToken.toString().trim());
        return result;
    }

    private String getFieldValue(List<String> fields, List<String> headers, String columnName) {
        for (int i = 0; i < headers.size(); i++) {
            if (headers.get(i).equalsIgnoreCase(columnName)) {
                if (i < fields.size()) {
                    return fields.get(i);
                }
            }
        }
        return null;
    }
}