package com.medtrack.config;

import com.medtrack.auth.model.User;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.model.*;
import com.medtrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.medtrack.model.EquipmentStatus;

import java.time.LocalDate;

/**
 * Bootstraps initial state for the local and testing H2 database environments on application startup.
 * Provides default users with different authorization roles (admin, technician, supplier),
 * sample medical equipment profiles, maintenance schedules, and initial equipment procurement orders.
 *
 * Designed with idempotent business-key checks to prevent data duplication across system restarts.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.data-initializer.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final EquipmentOrderRepository equipmentOrderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed Users (Roles: Admin, Technician, Supplier)
        // Ensure default accounts exist for localized developer testing.
        // Hashing passwords using PasswordEncoder to ensure security best practices even in transient H2 databases.
        if (userRepository.findByEmail("hospital@medtrack.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Admin User")
                    .username("admin")
                    .email("hospital@medtrack.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("hospital")
                    .phone("+1 (555) 019-2834")
                    .organization("St. Mary Clinic")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

        }
        if (userRepository.findByEmail("tech@medtrack.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("John Tech")
                    .username("technician")
                    .email("tech@medtrack.com")
                    .password(passwordEncoder.encode("tech123"))
                    .role("Technician")
                    .phone("+1 (555) 019-2835")
                    .organization("Maintenance Hub")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

        }
        if (userRepository.findByEmail("supplier@medtrack.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Global Supplies")
                    .username("supplier")
                    .email("supplier@medtrack.com")
                    .password(passwordEncoder.encode("supply123"))
                    .role("Supplier")
                    .phone("+1 (555) 019-2836")
                    .organization("Global Suppliers Ltd")
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());
        }

        User hospitalUser = userRepository.findByEmail("hospital@medtrack.com")
                .orElseThrow(() -> new IllegalStateException("Seed hospital user was not created"));
        Hospital hospital = hospitalRepository.findByUserId(hospitalUser.getId())
                .orElseGet(() -> hospitalRepository.save(Hospital.builder()
                        .name("City General Hospital")
                        .location("Local Development")
                        .user(hospitalUser)
                        .build()));

        // 2. Seed Equipment Profiles
        // Inserts a baseline of medical devices mapped to distinct hospital units (Radiology, ICU).
        // Includes varied operating statuses (Operational, Maintenance) for filtering validations.
        if (equipmentRepository.findByEquipmentCode("EQ-1001").isEmpty()) {
            equipmentRepository.save(Equipment.builder()
                    .name("MRI Scanner X100")
                    .equipmentCode("EQ-1001")
                    .model("Siemens Healthcare")
                    .serialNumber("SN-9921-A")
                    .department("Radiology")
                    .status(EquipmentStatus.ACTIVE)
                    .category("Imaging")
                    .purchaseDate(LocalDate.now().minusYears(2))
                    .hospital(hospital)
                    .build());

        }
        if (equipmentRepository.findByEquipmentCode("EQ-1002").isEmpty()) {
            equipmentRepository.save(Equipment.builder()
                    .name("Portable Ventilator")
                    .equipmentCode("EQ-1002")
                    .model("Philips V60")
                    .serialNumber("SN-1102-B")
                    .department("ICU")
                    .status(EquipmentStatus.UNDER_MAINTENANCE)
                    .category("Respiratory")
                    .purchaseDate(LocalDate.now().minusMonths(6))
                    .hospital(hospital)
                    .build());
        }

        // 3. Seed Maintenance Schedules
        // Populates initial maintenance workflows referencing the seeded equipment.
        // Utilizes the type-safe MaintenanceStatus enum configuration introduced in recent updates.
        if (maintenanceTaskRepository.count() == 0) {
            Equipment mriScanner = equipmentRepository.findByEquipmentCode("EQ-1001")
                    .orElseThrow(() -> new IllegalStateException("Seed MRI equipment was not created"));
            Equipment ventilator = equipmentRepository.findByEquipmentCode("EQ-1002")
                    .orElseThrow(() -> new IllegalStateException("Seed ventilator equipment was not created"));

            maintenanceTaskRepository.save(MaintenanceTask.builder()
                    .taskCode("MNT-5001")
                    // Required API-facing equipment reference after maintenance validation was added.
                    .equipmentId("EQ-1001")
                    .equipment("MRI Scanner X100")
                    .equipmentRecord(mriScanner)
                    .hospital(hospital.getName())
                    .hospitalId(hospital.getId())
                    .maintenanceType("Inspection")
                    .deadline(LocalDate.now().plusDays(5))
                    .priority("Normal")
                    .status(MaintenanceStatus.SCHEDULED)
                    .description("Routine quarterly inspection of magnet cooling system.")
                    .build());

            maintenanceTaskRepository.save(MaintenanceTask.builder()
                    .taskCode("MNT-5002")
                    .equipmentId("EQ-1002")
                    .equipment("Portable Ventilator")
                    .equipmentRecord(ventilator)
                    .hospital(hospital.getName())
                    .hospitalId(hospital.getId())
                    .maintenanceType("Corrective")
                    .deadline(LocalDate.now().plusDays(1))
                    .priority("Critical")
                    .status(MaintenanceStatus.IN_PROGRESS)
                    .assignedTechnician("tech@medtrack.com")
                    .description("Oxygen sensor failure reported. Requires calibration.")
                    .build());
        }

        // 4. Seed Procurement Orders
        // Inserts baseline equipment procurement records to test requisition workflows.
        if (equipmentOrderRepository.count() == 0) {
            equipmentOrderRepository.save(EquipmentOrder.builder()
                    .orderCode("ORD-1001")
                    .equipmentId("EQ-1001")
                    .equipmentName("Defibrillator Pads (Box of 10)")
                    .quantity(5)
                    .hospital("City General Hospital")
                    .createdBy("Admin User")
                    .orderDate(LocalDate.now().minusDays(2).atStartOfDay())
                    .status("PENDING")
                    .build());
        }

        System.out.println(">> Database Seeded Successfully!");
    }
}
