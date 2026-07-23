package com.medtrack.auth.authority;

import com.medtrack.auth.authority.dto.*;
import com.medtrack.auth.authority.model.AuthorityAuditLog;
import com.medtrack.auth.authority.repository.AuthorityAuditRepository;
import com.medtrack.auth.authority.service.AuthorityService;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Enterprise Unit Tests for {@link AuthorityService}.
 * Covers user authority version retrieval, version increments, global authority bumps,
 * token version validation, role permissions mapping, and audit log tracking.
 */
@ExtendWith(MockitoExtension.class)
public class AuthorityServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthorityAuditRepository auditRepository;

    private AuthorityService authorityService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        authorityService = new AuthorityService(userRepository, auditRepository);

        sampleUser = User.builder()
                .id(100L)
                .name("Dr. Alice Smith")
                .username("asmith")
                .email("alice@stmarys.org")
                .password("hashed_pwd")
                .phone("+1 555-0199")
                .organization("St. Mary Hospital")
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .authorityVersion(1L)
                .build();
    }

    @Test
    void getAuthorityVersion_Success() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));

        AuthorityVersionResponse response = authorityService.getAuthorityVersion(100L);

        assertNotNull(response);
        assertEquals(100L, response.getUserId());
        assertEquals("asmith", response.getUsername());
        assertEquals("HOSPITAL", response.getRole());
        assertEquals(1L, response.getAuthorityVersion());
        assertTrue(response.isActive());
        assertTrue(response.getPermissions().contains("READ_EQUIPMENT"));
        assertTrue(response.getPermissions().contains("CREATE_ORDERS"));
        verify(userRepository).findById(100L);
    }

    @Test
    void getAuthorityVersion_UserNotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authorityService.getAuthorityVersion(999L));
        assertTrue(ex.getMessage().contains("User not found"));
    }

    @Test
    void incrementAuthorityVersion_Success() {
        AuthorityUpdateRequest request = AuthorityUpdateRequest.builder()
                .userId(100L)
                .reason("Security role demotion")
                .updatedBy("ADMIN_JOHN")
                .build();

        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthorityVersionResponse response = authorityService.incrementAuthorityVersion(request);

        assertNotNull(response);
        assertEquals(2L, response.getAuthorityVersion());
        assertTrue(response.getMessage().contains("Prior sessions invalidated"));

        ArgumentCaptor<AuthorityAuditLog> auditCaptor = ArgumentCaptor.forClass(AuthorityAuditLog.class);
        verify(auditRepository).save(auditCaptor.capture());
        AuthorityAuditLog savedLog = auditCaptor.getValue();

        assertEquals(100L, savedLog.getUserId());
        assertEquals("asmith", savedLog.getUsername());
        assertEquals("VERSION_INCREMENT", savedLog.getEventType());
        assertEquals(1L, savedLog.getPreviousAuthorityVersion());
        assertEquals(2L, savedLog.getNewAuthorityVersion());
        assertEquals("ADMIN_JOHN", savedLog.getUpdatedBy());
    }

    @Test
    void bumpGlobalAuthorityVersion_Success() {
        User user2 = User.builder()
                .id(101L)
                .username("btech")
                .email("tech@stmarys.org")
                .role("TECHNICIAN")
                .authorityVersion(3L)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(sampleUser, user2));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        int updatedCount = authorityService.bumpGlobalAuthorityVersion("SECURITY_OFFICER", "Quarterly key rotation");

        assertEquals(2, updatedCount);
        assertEquals(2L, sampleUser.getAuthorityVersion());
        assertEquals(4L, user2.getAuthorityVersion());

        verify(auditRepository, times(2)).save(any(AuthorityAuditLog.class));
    }

    @Test
    void validateAuthorityVersion_MatchingVersion_ReturnsTrue() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));

        boolean valid = authorityService.validateAuthorityVersion(100L, 1L);

        assertTrue(valid);
    }

    @Test
    void validateAuthorityVersion_MismatchVersion_ReturnsFalse() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(sampleUser));

        boolean valid = authorityService.validateAuthorityVersion(100L, 99L);

        assertFalse(valid);
    }

    @Test
    void getAuditLogsForUser_Success() {
        AuthorityAuditLog log1 = AuthorityAuditLog.builder()
                .id(1L)
                .userId(100L)
                .username("asmith")
                .eventType("VERSION_INCREMENT")
                .description("Role change")
                .previousAuthorityVersion(1L)
                .newAuthorityVersion(2L)
                .updatedBy("ADMIN")
                .timestamp(LocalDateTime.now())
                .build();

        when(auditRepository.findByUserIdOrderByTimestampDesc(100L)).thenReturn(List.of(log1));

        List<AuditLogResponse> logs = authorityService.getAuditLogsForUser(100L);

        assertNotNull(logs);
        assertEquals(1, logs.size());
        assertEquals("VERSION_INCREMENT", logs.get(0).getEventType());
        assertEquals(100L, logs.get(0).getUserId());
    }

    @Test
    void getPermissionsForRole_TechnicianPermissions() {
        var perms = authorityService.getPermissionsForRole("TECHNICIAN");

        assertNotNull(perms);
        assertTrue(perms.contains("UPDATE_MAINTENANCE"));
        assertTrue(perms.contains("SUBMIT_DIAGNOSTICS"));
        assertFalse(perms.contains("CREATE_ORDERS"));
    }
}
