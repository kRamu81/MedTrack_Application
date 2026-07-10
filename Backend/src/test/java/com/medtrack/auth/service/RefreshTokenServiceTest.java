package com.medtrack.auth.service;

import com.medtrack.auth.model.RefreshToken;
import com.medtrack.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link RefreshTokenService} covering lifecycle management of database-backed refresh tokens.
 */
@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    void createRefreshToken_Success() {
        Long userId = 1L;
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationDays", 7L);

        RefreshToken savedToken = RefreshToken.builder()
                .id(10L)
                .userId(userId)
                .token("uuid-string")
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedToken);

        RefreshToken result = refreshTokenService.createRefreshToken(userId);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("uuid-string", result.getToken());
        assertEquals(userId, result.getUserId());
        assertFalse(result.isRevoked());

        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void verifyToken_Success() {
        String tokenStr = "valid-token";
        RefreshToken mockToken = RefreshToken.builder()
                .userId(1L)
                .token(tokenStr)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));

        RefreshToken result = refreshTokenService.verifyToken(tokenStr);

        assertNotNull(result);
        assertEquals(tokenStr, result.getToken());
    }

    @Test
    void verifyToken_NotFound_ThrowsException() {
        String tokenStr = "unknown-token";
        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> refreshTokenService.verifyToken(tokenStr));
    }

    @Test
    void verifyToken_Revoked_ThrowsException() {
        String tokenStr = "revoked-token";
        RefreshToken mockToken = RefreshToken.builder()
                .userId(1L)
                .token(tokenStr)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .revoked(true)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));

        assertThrows(BadCredentialsException.class, () -> refreshTokenService.verifyToken(tokenStr));
    }

    @Test
    void verifyToken_Expired_ThrowsException() {
        String tokenStr = "expired-token";
        RefreshToken mockToken = RefreshToken.builder()
                .userId(1L)
                .token(tokenStr)
                .expiryDate(LocalDateTime.now().minusDays(1)) // Expired yesterday
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));

        assertThrows(BadCredentialsException.class, () -> refreshTokenService.verifyToken(tokenStr));
    }

    @Test
    void revokeToken_Success() {
        String tokenStr = "some-token";
        RefreshToken mockToken = RefreshToken.builder()
                .token(tokenStr)
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));
        when(refreshTokenRepository.save(mockToken)).thenReturn(mockToken);

        refreshTokenService.revokeToken(tokenStr);

        assertTrue(mockToken.isRevoked());
        verify(refreshTokenRepository).save(mockToken);
    }

    @Test
    void revokeToken_NotFound_NoOp() {
        String tokenStr = "some-token";
        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.empty());

        refreshTokenService.revokeToken(tokenStr);

        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    void revokeAllForUser_Success() {
        Long userId = 1L;
        doNothing().when(refreshTokenRepository).deleteByUserId(userId);

        refreshTokenService.revokeAllForUser(userId);

        verify(refreshTokenRepository).deleteByUserId(userId);
    }
}
