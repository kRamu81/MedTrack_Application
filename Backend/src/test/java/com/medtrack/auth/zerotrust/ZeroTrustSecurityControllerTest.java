package com.medtrack.auth.zerotrust;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.zerotrust.controller.ZeroTrustSecurityController;
import com.medtrack.auth.zerotrust.dto.*;
import com.medtrack.auth.zerotrust.service.ZeroTrustSecurityService;
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
 * Controller unit tests for {@link ZeroTrustSecurityController}.
 */
@ExtendWith(MockitoExtension.class)
public class ZeroTrustSecurityControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ZeroTrustSecurityService zeroTrustSecurityService;

    @InjectMocks
    private ZeroTrustSecurityController zeroTrustSecurityController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(zeroTrustSecurityController).build();
    }

    @Test
    void getActivePolicy_Success() throws Exception {
        ZeroTrustPolicyResponse response = ZeroTrustPolicyResponse.builder()
                .id(1L)
                .policyName("DEFAULT_ZERO_TRUST_POLICY")
                .geoFencingEnabled(true)
                .maxFailedAttemptsThreshold(5)
                .build();

        when(zeroTrustSecurityService.getActivePolicy()).thenReturn(response);

        mockMvc.perform(get("/api/auth/zerotrust/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("DEFAULT_ZERO_TRUST_POLICY"))
                .andExpect(jsonPath("$.maxFailedAttemptsThreshold").value(5));
    }

    @Test
    void evaluateIpThreat_Success() throws Exception {
        IpThreatEvaluationResponse response = IpThreatEvaluationResponse.builder()
                .ipAddress("192.168.1.100")
                .countryCode("US")
                .threatScore(10)
                .threatLevel("LOW")
                .blocked(false)
                .build();

        when(zeroTrustSecurityService.evaluateIpThreat("192.168.1.100", "US")).thenReturn(response);

        mockMvc.perform(get("/api/auth/zerotrust/evaluate?ipAddress=192.168.1.100&countryCode=US"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ipAddress").value("192.168.1.100"))
                .andExpect(jsonPath("$.blocked").value(false));
    }

    @Test
    void unblockIp_Success() throws Exception {
        IpThreatEvaluationResponse response = IpThreatEvaluationResponse.builder()
                .ipAddress("10.0.0.5")
                .blocked(false)
                .threatLevel("LOW")
                .build();

        when(zeroTrustSecurityService.unblockIp("10.0.0.5")).thenReturn(response);

        mockMvc.perform(post("/api/auth/zerotrust/unblock?ipAddress=10.0.0.5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.blocked").value(false));
    }
}
