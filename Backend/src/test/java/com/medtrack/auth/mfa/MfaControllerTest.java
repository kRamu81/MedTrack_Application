package com.medtrack.auth.mfa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.mfa.controller.MfaController;
import com.medtrack.auth.mfa.dto.*;
import com.medtrack.auth.mfa.service.MfaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
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

    @InjectMocks
    private MfaController mfaController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(mfaController).build();
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

        mockMvc.perform(post("/api/auth/mfa/setup/50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(50))
                .andExpect(jsonPath("$.secretKey").value("SECRET1234567890"))
                .andExpect(jsonPath("$.recoveryCodes.length()").value(2));
    }

    @Test
    void verifyMfa_Success() throws Exception {
        when(mfaService.verifyAndEnableMfa(any())).thenReturn(true);

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(50L)
                .code("123456")
                .build();

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
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

        mockMvc.perform(get("/api/auth/mfa/status/50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true))
                .andExpect(jsonPath("$.activeDeviceCount").value(2));
    }

    @Test
    void disableMfa_Success() throws Exception {
        when(mfaService.disableMfa(50L)).thenReturn(true);

        mockMvc.perform(post("/api/auth/mfa/disable/50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
