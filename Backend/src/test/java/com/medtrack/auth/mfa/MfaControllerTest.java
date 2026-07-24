package com.medtrack.auth.mfa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.mfa.controller.MfaController;
import com.medtrack.auth.mfa.dto.*;
import com.medtrack.auth.mfa.service.MfaService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit & Endpoint Controller Tests for {@link MfaController}.
 */
@ExtendWith(MockitoExtension.class)
public class MfaControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MfaService mfaService;

    @Mock
    private OwnershipAccessGuard ownershipAccessGuard;

    @InjectMocks
    private MfaController mfaController;

    private final Authentication hospitalAdmin = new UsernamePasswordAuthenticationToken(
            "hospital@medtrack.org", null, List.of(new SimpleGrantedAuthority("ROLE_HOSPITAL")));

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(mfaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void setupMfa_Success() throws Exception {
        MfaSetupResponse response = MfaSetupResponse.builder()
                .userId(50L)
                .secretKey("SECRET1234567890")
                .otpAuthUri("otpauth://totp/MedTrack:user@medtrack.org")
                .recoveryCodes(List.of("REC1-KEY2", "REC3-KEY4"))
                .message("MFA setup initiated")
                .build();

        when(mfaService.setupMfa(50L)).thenReturn(response);

        mockMvc.perform(post("/api/auth/mfa/setup/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(50))
                .andExpect(jsonPath("$.secretKey").value("SECRET1234567890"))
                .andExpect(jsonPath("$.recoveryCodes.length()").value(2));
    }

    @Test
    void setupMfa_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(post("/api/auth/mfa/setup/50"))
                .andExpect(status().isForbidden());
    }

    @Test
    void verifyMfa_Success() throws Exception {
        when(mfaService.verifyAndEnableMfa(any())).thenReturn(true);

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(50L)
                .code("123456")
                .build();

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .principal(hospitalAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void verifyMfa_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(50L)
                .code("123456")
                .build();

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMfaStatus_Success() throws Exception {
        MfaStatusResponse response = MfaStatusResponse.builder()
                .userId(50L)
                .mfaEnabled(true)
                .activeDeviceCount(2)
                .message("MFA active")
                .build();

        when(mfaService.getMfaStatus(50L)).thenReturn(response);

        mockMvc.perform(get("/api/auth/mfa/status/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true))
                .andExpect(jsonPath("$.activeDeviceCount").value(2));
    }

    @Test
    void getMfaStatus_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(get("/api/auth/mfa/status/50"))
                .andExpect(status().isForbidden());
    }

    @Test
    void disableMfa_Success() throws Exception {
        when(mfaService.disableMfa(50L)).thenReturn(true);

        mockMvc.perform(post("/api/auth/mfa/disable/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void disableMfa_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(post("/api/auth/mfa/disable/50"))
                .andExpect(status().isForbidden());
    }
}
