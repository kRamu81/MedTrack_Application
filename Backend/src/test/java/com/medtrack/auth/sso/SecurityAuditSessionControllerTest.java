package com.medtrack.auth.sso;

import com.medtrack.auth.security.OwnershipAccessGuard;
import com.medtrack.auth.sso.controller.SecurityAuditSessionController;
import com.medtrack.auth.sso.dto.SecurityRiskAnalysisResponse;
import com.medtrack.auth.sso.model.SecurityAuditSessionLog;
import com.medtrack.auth.sso.service.SecurityAuditSessionService;
import com.medtrack.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller unit tests for {@link SecurityAuditSessionController}, covering both the
 * happy path and rejection of cross-account access via {@link OwnershipAccessGuard}.
 */
@ExtendWith(MockitoExtension.class)
public class SecurityAuditSessionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityAuditSessionService auditSessionService;

    @Mock
    private OwnershipAccessGuard ownershipAccessGuard;

    @InjectMocks
    private SecurityAuditSessionController securityAuditSessionController;

    private final Authentication hospitalAdmin = new UsernamePasswordAuthenticationToken(
            "hospital@medtrack.org", null, List.of(new SimpleGrantedAuthority("ROLE_HOSPITAL")));

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(securityAuditSessionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void evaluateRisk_Success() throws Exception {
        SecurityRiskAnalysisResponse response = SecurityRiskAnalysisResponse.builder()
                .userId(50L)
                .threatRiskScore(20)
                .riskLevel("LOW")
                .suspiciousEventCount(0)
                .detectedAnomalies(List.of())
                .evaluatedAt(LocalDateTime.now())
                .build();

        when(auditSessionService.evaluateSecurityRisk(50L)).thenReturn(response);

        mockMvc.perform(get("/api/auth/audit/risk/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(50))
                .andExpect(jsonPath("$.riskLevel").value("LOW"));
    }

    @Test
    void evaluateRisk_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(get("/api/auth/audit/risk/50"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserAuditLogs_Success() throws Exception {
        SecurityAuditSessionLog log = SecurityAuditSessionLog.builder()
                .id(1L)
                .userId(50L)
                .eventType("LOGIN_SUCCESS")
                .riskScore(10)
                .suspiciousActivity(false)
                .timestamp(LocalDateTime.now())
                .build();

        when(auditSessionService.getUserAuditLogs(50L)).thenReturn(List.of(log));

        mockMvc.perform(get("/api/auth/audit/user/50").principal(hospitalAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(50))
                .andExpect(jsonPath("$[0].eventType").value("LOGIN_SUCCESS"));
    }

    @Test
    void getUserAuditLogs_DeniedForOtherUser() throws Exception {
        doThrow(new AccessDeniedException("Not authorized"))
                .when(ownershipAccessGuard).assertSelfOrHospitalAdmin(any(), eq(50L));

        mockMvc.perform(get("/api/auth/audit/user/50"))
                .andExpect(status().isForbidden());
    }
}
