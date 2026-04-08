package com.medtrack.config;

import com.medtrack.model.*;
import com.medtrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

/**
 * Seeds initial data for the H2 database on startup.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final EquipmentOrderRepository equipmentOrderRepository;

    @Override
    public void run(String... args) {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                .name("Admin User")
                .email("hospital@medtrack.com")
                .password("admin123")
                .role("Hospital Admin")
                .hospitalName("City General Hospital")
                .build());

            userRepository.save(User.builder()
                .name("John Tech")
                .email("tech@medtrack.com")
                .password("tech123")
                .role("Technician")
                .build());

            userRepository.save(User.builder()
                .name("Global Supplies")
                .email("supplier@medtrack.com")
                .password("supply123")
                .role("Supplier")
                .build());
        }

        // 2. Seed Equipment
        if (equipmentRepository.count() == 0) {
            equipmentRepository.save(Equipment.builder()
                .name("MRI Scanner X100")
                .deviceCode("EQ-1001")
                .model("Siemens Healthcare")
                .serialNumber("SN-9921-A")
                .department("Radiology")
                .status("Operational")
                .category("Imaging")
                .purchaseDate(LocalDate.now().minusYears(2))
                .build());

            equipmentRepository.save(Equipment.builder()
                .name("Portable Ventilator")
                .deviceCode("EQ-1002")
                .model("Philips V60")
                .serialNumber("SN-1102-B")
                .department("ICU")
                .status("Maintenance")
                .category("Respiratory")
                .purchaseDate(LocalDate.now().minusMonths(6))
                .build());
        }

        // 3. Seed Maintenance Tasks
        if (maintenanceTaskRepository.count() == 0) {
            maintenanceTaskRepository.save(MaintenanceTask.builder()
                .taskCode("MNT-5001")
                .equipment("MRI Scanner X100")
                .hospital("City General Hospital")
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(5))
                .priority("Normal")
                .status("Scheduled")
                .description("Routine quarterly inspection of magnet cooling system.")
                .build());

            maintenanceTaskRepository.save(MaintenanceTask.builder()
                .taskCode("MNT-5002")
                .equipment("Portable Ventilator")
                .hospital("City General Hospital")
                .maintenanceType("Corrective")
                .deadline(LocalDate.now().plusDays(1))
                .priority("Critical")
                .status("In Progress")
                .description("Oxygen sensor failure reported. Requires calibration.")
                .build());
        }

        // 4. Seed Orders
        if (equipmentOrderRepository.count() == 0) {
            equipmentOrderRepository.save(EquipmentOrder.builder()
                .equipmentName("Defibrillator Pads (Box of 10)")
                .hospital("City General Hospital")
                .orderedDate(LocalDate.now().minusDays(2))
                .shippingStatus("Processing")
                .price("₹15,000")
                .category("Emergency")
                .build());
        }

        System.out.println(">> Database Seeded Successfully!");
    }
}
