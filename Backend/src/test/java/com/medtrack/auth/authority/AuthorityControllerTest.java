package com.medtrack.auth.authority;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.authority.controller.AuthorityController;
import com.medtrack.auth.authority.dto.*;
import com.medtrack.auth.authority.service.AuthorityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Enterprise Unit & Endpoint Controller Tests for {@link AuthorityController}.
 */
@ExtendWith(MockitoExtension.class)
public class AuthorityControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthorityService authorityService;

    @InjectMocks
    private AuthorityController authorityController;

    private AuthorityVersionResponse sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authorityController).build();

        sampleResponse = AuthorityVersionResponse.builder()
                .userId(10L)
                .email("test@medtrack.org")
                .username("testuser")
                .role("HOSPITAL")
                .authorityVersion(2L)
                .permissions(Set.of("READ_EQUIPMENT", "WRITE_EQUIPMENT"))
                .active(true)
                .message("Authority details retrieved successfully")
                .build();
    }

    @Test
    void getAuthorityVersion_Success() throws Exception {
        when(authorityService.getAuthorityVersion(10L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/auth/authority/version/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10))
                .andExpect(jsonPath("$.authorityVersion").value(2))
                .andExpect(jsonPath("$.role").value("HOSPITAL"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void incrementAuthorityVersion_Success() throws Exception {
        AuthorityUpdateRequest request = AuthorityUpdateRequest.builder()
                .userId(10L)
                .reason("Security revoking active sessions")
                .updatedBy("ADMIN")
                .build();

        when(authorityService.incrementAuthorityVersion(any())).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/auth/authority/version/increment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorityVersion").value(2))
                .andExpect(jsonPath("$.userId").value(10));
    }

    @Test
    void bumpGlobalAuthorityVersion_Success() throws Exception {
        when(authorityService.bumpGlobalAuthorityVersion(any(), any())).thenReturn(15);

        Map<String, String> payload = Map.of("reason", "Global upgrade", "updatedBy", "SYSTEM_ADMIN");

        mockMvc.perform(post("/api/auth/authority/version/bump-global")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.accountsUpdated").value(15));
    }

    @Test
    void getAuditLogsForUser_Success() throws Exception {
        AuditLogResponse logDto = AuditLogResponse.builder()
                .id(100L)
                .userId(10L)
                .username("testuser")
                .eventType("VERSION_INCREMENT")
                .description("Version incremented")
                .previousAuthorityVersion(1L)
                .newAuthorityVersion(2L)
                .updatedBy("ADMIN")
                .timestamp(LocalDateTime.now())
                .build();

        when(authorityService.getAuditLogsForUser(10L)).thenReturn(List.of(logDto));

        mockMvc.perform(get("/api/auth/authority/audit-logs/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].eventType").value("VERSION_INCREMENT"))
                .andExpect(jsonPath("$[0].userId").value(10));
    }
}
