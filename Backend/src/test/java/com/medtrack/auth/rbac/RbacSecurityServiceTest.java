package com.medtrack.auth.rbac;

import com.medtrack.auth.model.User;
import com.medtrack.auth.rbac.dto.*;
import com.medtrack.auth.rbac.model.*;
import com.medtrack.auth.rbac.repository.*;
import com.medtrack.auth.rbac.service.RbacSecurityService;
import com.medtrack.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RbacSecurityService}.
 */
@ExtendWith(MockitoExtension.class)
public class RbacSecurityServiceTest {

    @Mock
    private SecurityRoleRepository roleRepository;

    @Mock
    private SecurityPermissionRepository permissionRepository;

    @Mock
    private RolePermissionMappingRepository mappingRepository;

    @Mock
    private UserRepository userRepository;

    private RbacSecurityService rbacService;

    @BeforeEach
    void setUp() {
        rbacService = new RbacSecurityService(roleRepository, permissionRepository, mappingRepository, userRepository);
    }

    @Test
    void createRole_Success() {
        RoleCreateRequest request = RoleCreateRequest.builder()
                .roleName("BIOMED_LEAD")
                .description("Head biomedical engineer")
                .build();

        when(roleRepository.save(any(SecurityRole.class))).thenAnswer(i -> i.getArgument(0));

        RoleResponse response = rbacService.createRole(request);

        assertNotNull(response);
        assertEquals("ROLE_BIOMED_LEAD", response.getRoleName());
        assertFalse(response.isSystemRole());
        verify(roleRepository).save(any(SecurityRole.class));
    }

    @Test
    void checkUserPermission_AdminRole_ReturnsGrantedTrue() {
        User adminUser = User.builder()
                .id(100L)
                .username("admin")
                .role("admin")
                .build();

        SecurityRole adminRole = SecurityRole.builder()
                .id(1L)
                .roleName("ROLE_ADMIN")
                .build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(adminUser));
        when(roleRepository.findByRoleName("ROLE_ADMIN")).thenReturn(Optional.of(adminRole));
        when(mappingRepository.findByRoleId(1L)).thenReturn(List.of());

        UserPermissionCheckResponse response = rbacService.checkUserPermission(100L, "SSO:CONFIGURE");

        assertTrue(response.isGranted());
        assertEquals("ROLE_ADMIN", response.getRoleName());
    }

    @Test
    void updateRolePermissions_Success() {
        SecurityRole role = SecurityRole.builder()
                .id(5L)
                .roleName("ROLE_DOCTOR")
                .build();

        SecurityPermission perm = SecurityPermission.builder()
                .id(10L)
                .permissionCode("EQUIPMENT:READ")
                .build();

        when(roleRepository.findById(5L)).thenReturn(Optional.of(role));
        when(permissionRepository.findByPermissionCode("EQUIPMENT:READ")).thenReturn(Optional.of(perm));
        when(mappingRepository.findByRoleId(5L)).thenReturn(List.of());

        UpdateRolePermissionsRequest request = UpdateRolePermissionsRequest.builder()
                .roleId(5L)
                .permissionCodes(List.of("EQUIPMENT:READ"))
                .build();

        RoleResponse response = rbacService.updateRolePermissions(request);

        assertNotNull(response);
        assertEquals(1, response.getGrantedPermissionCodes().size());
        assertTrue(response.getGrantedPermissionCodes().contains("EQUIPMENT:READ"));
    }
}
