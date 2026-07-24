package com.medtrack.auth.mfa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.mfa.controller.DeviceSessionController;
import com.medtrack.auth.mfa.dto.RevokeDeviceRequest;
import com.medtrack.auth.mfa.dto.UserSessionDeviceResponse;
import com.medtrack.auth.mfa.service.DeviceSessionService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link DeviceSessionController}, covering both the
 * happy path and rejection of cross-account access via {@link OwnershipAccessGuard}.
 */
@ExtendWith(MockitoExtension.class)
public class DeviceSessionControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DeviceSessionService deviceSessionService;

    @Mock
    private OwnershipAccessGuard ownershipAccessGuard;

    @InjectMocks
    private DeviceSessionController deviceSessionController;

    private final Authentication hospitalAdmin = new UsernamePasswordAuthenticationToken(
            "hospital@medtrack.org", null, List.of(new SimpleGrantedAuthority("ROLE_HOSPITAL")));

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(deviceSessionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getActiveDevices_Success() throws Exception {
        UserSessionDeviceResponse response = UserSessionDeviceResponse.builder()
                .id(1L)
                .userId(50L)
                .deviceId("device-1")
                .active(true)
                .build();

        when(deviceSessionService.getActiveDevices(50L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/auth/devices/active/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(50))
                .andExpect(jsonPath("$[0].deviceId").value("device-1"));
    }

    @Test
    void getActiveDevices_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(get("/api/auth/devices/active/50"))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerDevice_Success() throws Exception {
        UserSessionDeviceResponse response = UserSessionDeviceResponse.builder()
                .id(2L)
                .userId(50L)
                .deviceId("device-2")
                .active(true)
                .build();

        when(deviceSessionService.registerDeviceSession(eq(50L), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/devices/register/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deviceId").value("device-2"));
    }

    @Test
    void registerDevice_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(post("/api/auth/devices/register/50"))
                .andExpect(status().isForbidden());
    }

    @Test
    void revokeDevice_Success() throws Exception {
        when(deviceSessionService.revokeDeviceSession(any())).thenReturn(true);

        RevokeDeviceRequest request = RevokeDeviceRequest.builder()
                .userId(50L)
                .deviceId("device-1")
                .build();

        mockMvc.perform(post("/api/auth/devices/revoke")
                        .principal(hospitalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void revokeDevice_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        RevokeDeviceRequest request = RevokeDeviceRequest.builder()
                .userId(50L)
                .deviceId("device-1")
                .build();

        mockMvc.perform(post("/api/auth/devices/revoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void revokeAllOtherDevices_Success() throws Exception {
        when(deviceSessionService.revokeAllOtherDevices(50L, "current-device")).thenReturn(3);

        mockMvc.perform(post("/api/auth/devices/revoke-others/50")
                        .principal(hospitalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("currentDeviceId", "current-device"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionsTerminated").value(3));
    }

    @Test
    void revokeAllOtherDevices_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(post("/api/auth/devices/revoke-others/50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("currentDeviceId", "current-device"))))
                .andExpect(status().isForbidden());
    }
}
