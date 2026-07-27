package com.medtrack.repository;

import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.model.User;
import com.medtrack.model.Equipment;
import com.medtrack.model.Hospital;
import com.medtrack.model.MaintenanceStatus;
import com.medtrack.model.MaintenanceTask;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringJUnitConfig(MaintenanceTaskRepositoryTest.RepositoryTestConfiguration.class)
@Transactional
class MaintenanceTaskRepositoryTest {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private MaintenanceTaskRepository taskRepository;

    @Test
    void ownershipScopedQueriesRequireTaskAndEquipmentHospitalToAgree() {
        Hospital equipmentHospital = persistHospital("Equipment Hospital");
        Hospital taskHospital = persistHospital("Task Hospital");
        Equipment equipment = persistEquipment(equipmentHospital);
        User inconsistentTechnician = persistTechnician("tech");
        User validTechnician = persistTechnician("valid-tech");
        MaintenanceTask inconsistentTask = persistTask(
                "MNT-INCONSISTENT", equipment, taskHospital, inconsistentTechnician);
        MaintenanceTask validTask = persistTask(
                "MNT-VALID", equipment, equipmentHospital, validTechnician);
        MaintenanceTask inconsistentCompletedTask = persistTask(
                "MNT-INCONSISTENT-COMPLETED", equipment, taskHospital, inconsistentTechnician);
        inconsistentCompletedTask.setStatus(MaintenanceStatus.COMPLETED);
        inconsistentCompletedTask.setCompletedAt(LocalDateTime.now());
        MaintenanceTask validCompletedTask = persistTask(
                "MNT-VALID-COMPLETED", equipment, equipmentHospital, validTechnician);
        validCompletedTask.setStatus(MaintenanceStatus.COMPLETED);
        validCompletedTask.setCompletedAt(LocalDateTime.now());
        entityManager.flush();
        entityManager.clear();

        assertTrue(taskRepository.findByHospitalId(taskHospital.getId()).isEmpty());
        assertTrue(taskRepository.findByAssignedTechnicianId(inconsistentTechnician.getId()).isEmpty());
        assertTrue(taskRepository.findByIdAndHospitalId(
                inconsistentTask.getId(), taskHospital.getId()).isEmpty());
        assertTrue(taskRepository.findByIdAndAssignedTechnicianId(
                inconsistentTask.getId(), inconsistentTechnician.getId()).isEmpty());
        assertTrue(taskRepository.findByIdAndHospitalIdForUpdate(
                inconsistentTask.getId(), taskHospital.getId()).isEmpty());
        assertTrue(taskRepository.findByIdAndAssignedTechnicianIdForUpdate(
                inconsistentTask.getId(), inconsistentTechnician.getId()).isEmpty());
        assertTrue(taskRepository.findByEquipmentRecord_IdAndHospitalId(
                equipment.getId(), taskHospital.getId()).isEmpty());
        assertTrue(taskRepository.findByHospitalIdWithFilters(
                taskHospital.getId(), MaintenanceStatus.SCHEDULED,
                equipment.getEquipmentCode(), Pageable.unpaged()).isEmpty());
        assertTrue(taskRepository.findByAssignedTechnicianIdWithFilters(
                inconsistentTechnician.getId(), MaintenanceStatus.SCHEDULED,
                equipment.getEquipmentCode(), Pageable.unpaged()).isEmpty());
        assertEquals(0, taskRepository.countByHospitalIdAndStatus(
                taskHospital.getId(), MaintenanceStatus.SCHEDULED));
        assertTrue(taskRepository.findCompletedTasksWithTimestamps(
                taskHospital.getId(), MaintenanceStatus.COMPLETED).isEmpty());
        assertNull(taskRepository.averageHoursWorkedByHospitalIdAndStatus(
                taskHospital.getId(), MaintenanceStatus.SCHEDULED));
        assertEquals(0, taskRepository.countByHospitalIdAndStatusNotAndPriority(
                taskHospital.getId(), MaintenanceStatus.COMPLETED, "Critical"));

        assertFalse(taskRepository.findByHospitalId(equipmentHospital.getId()).isEmpty());
        assertFalse(taskRepository.findByAssignedTechnicianId(validTechnician.getId()).isEmpty());
        assertTrue(taskRepository.findByIdAndHospitalId(
                validTask.getId(), equipmentHospital.getId()).isPresent());
        assertTrue(taskRepository.findByIdAndAssignedTechnicianId(
                validTask.getId(), validTechnician.getId()).isPresent());
        assertFalse(taskRepository.findByHospitalIdWithFilters(
                equipmentHospital.getId(), MaintenanceStatus.SCHEDULED,
                equipment.getEquipmentCode(), Pageable.unpaged()).isEmpty());
        assertFalse(taskRepository.findByAssignedTechnicianIdWithFilters(
                validTechnician.getId(), MaintenanceStatus.SCHEDULED,
                equipment.getEquipmentCode(), Pageable.unpaged()).isEmpty());
        assertEquals(1, taskRepository.countByHospitalIdAndStatus(
                equipmentHospital.getId(), MaintenanceStatus.SCHEDULED));
        assertEquals(1, taskRepository.findCompletedTasksWithTimestamps(
                equipmentHospital.getId(), MaintenanceStatus.COMPLETED).size());
        assertEquals(2.0, taskRepository.averageHoursWorkedByHospitalIdAndStatus(
                equipmentHospital.getId(), MaintenanceStatus.SCHEDULED));
        assertEquals(1, taskRepository.countByHospitalIdAndStatusNotAndPriority(
                equipmentHospital.getId(), MaintenanceStatus.COMPLETED, "Critical"));

        User renamedTechnician = entityManager.find(User.class, validTechnician.getId());
        renamedTechnician.setEmail("renamed-tech@medtrack.com");
        entityManager.flush();
        entityManager.clear();

        assertFalse(taskRepository.findByAssignedTechnicianId(
                validTechnician.getId()).isEmpty());
        assertTrue(taskRepository.findByAssignedTechnicianId(
                inconsistentTechnician.getId()).isEmpty());
    }

    private Hospital persistHospital(String name) {
        Hospital hospital = Hospital.builder()
                .name(name)
                .location("Test Location")
                .build();
        entityManager.persist(hospital);
        return hospital;
    }

    private Equipment persistEquipment(Hospital hospital) {
        Equipment equipment = Equipment.builder()
                .equipmentCode("EQ-OWNERSHIP")
                .name("Ownership Test Equipment")
                .department("QA")
                .hospital(hospital)
                .build();
        entityManager.persist(equipment);
        return equipment;
    }

    private User persistTechnician(String emailPrefix) {
        User technician = User.builder()
                .name("Test Technician")
                .username(emailPrefix)
                .email(emailPrefix + "@medtrack.com")
                .password("encoded-password")
                .role("technician")
                .accountStatus(AccountStatus.ACTIVE)
                .phone("0000000000")
                .organization("MedTrack")
                .build();
        entityManager.persist(technician);
        return technician;
    }

    private MaintenanceTask persistTask(
            String taskCode,
            Equipment equipment,
            Hospital hospital,
            User assignedTechnician) {
        MaintenanceTask task = MaintenanceTask.builder()
                .taskCode(taskCode)
                .equipmentId(equipment.getEquipmentCode())
                .equipment(equipment.getName())
                .equipmentRecord(equipment)
                .hospital(hospital.getName())
                .hospitalId(hospital.getId())
                .maintenanceType("Inspection")
                .deadline(LocalDate.now().plusDays(1))
                .assignedTechnician(assignedTechnician.getEmail())
                .assignedTechnicianRecord(assignedTechnician)
                .priority("Critical")
                .status(MaintenanceStatus.SCHEDULED)
                .hoursWorked(2.0)
                .build();
        entityManager.persist(task);
        return task;
    }

    @Configuration
    @EnableTransactionManagement
    @EnableJpaRepositories(
            basePackageClasses = MaintenanceTaskRepository.class,
            excludeFilters = @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {
                            EquipmentOrderRepository.class,
                            EquipmentRepository.class,
                            HospitalRepository.class
                    }))
    static class RepositoryTestConfiguration {

        @Bean
        DataSource dataSource() {
            return new EmbeddedDatabaseBuilder()
                    .setType(EmbeddedDatabaseType.H2)
                    .generateUniqueName(true)
                    .build();
        }

        @Bean
        LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
            LocalContainerEntityManagerFactoryBean factory =
                    new LocalContainerEntityManagerFactoryBean();
            factory.setDataSource(dataSource);
            factory.setPackagesToScan("com.medtrack.model", "com.medtrack.auth.model");
            factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
            factory.setJpaPropertyMap(Map.of(
                    "hibernate.hbm2ddl.auto", "create-drop",
                    "hibernate.show_sql", "false"));
            return factory;
        }

        @Bean
        PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
            return new JpaTransactionManager(entityManagerFactory);
        }
    }
}
