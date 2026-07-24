package com.medtrack.auth.rbac;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.rbac.controller.RbacSecurityController;
import com.medtrack.auth.rbac.dto.*;
import com.medtrack.auth.rbac.service.RbacSecurityService;
import com.medtrack.auth.security.OwnershipAccessGuard;
import com.medtrack.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link RbacSecurityController}.
 */
@ExtendWith(MockitoExtension.class)
public class RbacSecurityControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private RbacSecurityService rbacSecurityService;

    @Mock
    private OwnershipAccessGuard ownershipAccessGuard;

    @InjectMocks
    private RbacSecurityController rbacSecurityController;

    private final Authentication hospitalAdmin = new UsernamePasswordAuthenticationToken(
            "hospital@medtrack.org", null, List.of(new SimpleGrantedAuthority("ROLE_HOSPITAL")));

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(rbacSecurityController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllRoles_Success() throws Exception {
        RoleResponse response = RoleResponse.builder()
                .id(1L)
                .roleName("ROLE_ADMIN")
                .systemRole(true)
                .grantedPermissionCodes(List.of("EQUIPMENT:READ", "MAINTENANCE:SCHEDULE"))
                .build();

        when(rbacSecurityService.getAllRoles()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/auth/rbac/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].roleName").value("ROLE_ADMIN"));
    }

    @Test
    void createRole_Success() throws Exception {
        RoleResponse response = RoleResponse.builder()
                .id(2L)
                .roleName("ROLE_TECHNICIAN")
                .systemRole(false)
                .build();

        when(rbacSecurityService.createRole(any())).thenReturn(response);

        RoleCreateRequest request = RoleCreateRequest.builder()
                .roleName("TECHNICIAN")
                .description("Biomedical tech")
                .build();

        mockMvc.perform(post("/api/auth/rbac/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleName").value("ROLE_TECHNICIAN"));
    }

    @Test
    void checkUserPermission_Success() throws Exception {
        UserPermissionCheckResponse response = UserPermissionCheckResponse.builder()
                .userId(100L)
                .roleName("ROLE_ADMIN")
                .permissionCode("EQUIPMENT:READ")
                .granted(true)
                .message("Permission granted")
                .build();

        when(rbacSecurityService.checkUserPermission(100L, "EQUIPMENT:READ")).thenReturn(response);

        mockMvc.perform(get("/api/auth/rbac/check/100?permissionCode=EQUIPMENT:READ")
                        .principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.granted").value(true))
                .andExpect(jsonPath("$.roleName").value("ROLE_ADMIN"));
    }

    @Test
    void checkUserPermission_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("You are not authorized to access this account's security data"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), org.mockito.ArgumentMatchers.eq(100L));

        mockMvc.perform(get("/api/auth/rbac/check/100?permissionCode=EQUIPMENT:READ"))
                .andExpect(status().isForbidden());
    }
}
