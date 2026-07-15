
package com.medtrack.service;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.model.Equipment;
import com.medtrack.model.Hospital;
import com.medtrack.repository.EquipmentRepository;
import com.medtrack.repository.HospitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EquipmentServiceTest {

        @Mock
        private EquipmentRepository equipmentRepository;

        @Mock
        private HospitalRepository hospitalRepository;

        @Mock
        private UserRepository userRepository;

        @InjectMocks
        private EquipmentService equipmentService;

        private User mockUser;
        private Hospital mockHospital;
        private Equipment mockEquipment;
        private final String username = "hospital_admin";

        @BeforeEach
        void setUp() {
                mockUser = User.builder()
                                .id(1L)
                                .username(username)
                                .email("hospital@medtrack.com")
                                .build();

                mockHospital = Hospital.builder()
                                .id(10L)
                                .name("General Hospital")
                                .user(mockUser)
                                .build();

                mockEquipment = Equipment.builder()
                                .id(100L)
                                .name("MRI Scanner")
                                .model("Siemens A1")
                                .serialNumber("SN-12345")
                                .department("Radiology")
                                .category("Imaging")
                                .status("Operational")
                                .purchaseDate(LocalDate.of(2025, 1, 1))
                                .equipmentCode("EQ-100")
                                .hospital(mockHospital)
                                .build();
        }

        @Test
        void getAllEquipment_Success() {
                when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
                when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
                when(equipmentRepository.findByHospitalId(mockHospital.getId()))
                                .thenReturn(Collections.singletonList(mockEquipment));

                List<Equipment> result = equipmentService.getAllEquipment(username);

                assertNotNull(result);
                assertEquals(1, result.size());
                assertEquals("MRI Scanner", result.get(0).getName());
                verify(equipmentRepository).findByHospitalId(mockHospital.getId());
        }

        @Test
        void getEquipmentById_Success() {
                when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
                when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
                when(equipmentRepository.findByIdAndHospitalId(100L, mockHospital.getId()))
                                .thenReturn(Optional.of(mockEquipment));

                Equipment result = equipmentService.getEquipmentById(100L, username);

                assertNotNull(result);
                assertEquals("MRI Scanner", result.getName());
        }

        @Test
        void addEquipment_AutoGeneratesCode() {
                when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
                when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));

                Equipment newEq = Equipment.builder()
                                .name("Ventilator")
                                .department("ICU")
                                .build();

                when(equipmentRepository.save(any(Equipment.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                Equipment saved = equipmentService.addEquipment(newEq, username);

                assertNotNull(saved);
                assertNotNull(saved.getEquipmentCode());
                assertTrue(saved.getEquipmentCode().startsWith("EQ-"));
                assertEquals(mockHospital, saved.getHospital());
        }

        @Test
        void updateEquipment_Success() {
                when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
                when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
                when(equipmentRepository.findByIdAndHospitalId(100L, mockHospital.getId()))
                                .thenReturn(Optional.of(mockEquipment));
                when(equipmentRepository.save(any(Equipment.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                Equipment updatedDetails = Equipment.builder()
                                .name("Updated MRI")
                                .model("Siemens A2")
                                .serialNumber("SN-12345-UPD")
                                .department("Cardiology")
                                .status("Maintenance")
                                .purchaseDate(LocalDate.of(2025, 2, 2))
                                .build();

                Equipment result = equipmentService.updateEquipment(100L, updatedDetails, username);

                assertNotNull(result);
                assertEquals("Updated MRI", result.getName());
                assertEquals("Siemens A2", result.getModel());
                assertEquals("SN-12345-UPD", result.getSerialNumber());
                assertEquals("Cardiology", result.getDepartment());
                assertEquals("Maintenance", result.getStatus());
                assertEquals(LocalDate.of(2025, 2, 2), result.getPurchaseDate());

                verify(equipmentRepository).save(mockEquipment);
        }

        @Test
        void updateEquipment_NotFoundOrNoAccess_ThrowsException() {
                when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));
                when(hospitalRepository.findByUserId(mockUser.getId())).thenReturn(Optional.of(mockHospital));
                when(equipmentRepository.findByIdAndHospitalId(999L, mockHospital.getId()))
                                .thenReturn(Optional.empty());

                Equipment updatedDetails = Equipment.builder().name("Updated MRI").build();

                assertThrows(ResourceNotFoundException.class,
                                () -> equipmentService.updateEquipment(999L, updatedDetails, username));

                verify(equipmentRepository, never()).save(any());
        }
}
