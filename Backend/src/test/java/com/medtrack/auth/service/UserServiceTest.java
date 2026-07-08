package com.medtrack.auth.service;

import com.medtrack.auth.dto.AuthResponse;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.dto.RegisterRequest;
import com.medtrack.auth.model.RefreshToken;
import com.medtrack.auth.model.User;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.repository.RefreshTokenRepository;
import com.medtrack.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserService} covering registration, login, token refresh, and logout flows.
 * Uses real instances of {@link JwtUtil} and {@link RefreshTokenService} to bypass JDK 25 class-mocking restrictions.
 */
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private final JwtUtil jwtUtil = new JwtUtil();

    private RefreshTokenService refreshTokenService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationDays", 7L);
        userService = new UserService(userRepository, passwordEncoder, jwtUtil, refreshTokenService);
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role("HOSPITAL")
                .build();

        User savedUser = User.builder()
                .id(1L)
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("hashed_password")
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken rt = invocation.getArgument(0);
            rt.setId(10L);
            return rt;
        });

        AuthResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test User", response.getName());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("HOSPITAL", response.getRole());
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertNotNull(response.getRefreshToken());

        verify(userRepository).existsByUsername(request.getUsername());
        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void register_Success_DefaultRole() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role(null) // Should default to HOSPITAL
                .build();

        User savedUser = User.builder()
                .id(1L)
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("hashed_password")
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken rt = invocation.getArgument(0);
            rt.setId(10L);
            return rt;
        });

        AuthResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals("HOSPITAL", response.getRole());
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role("HOSPITAL")
                .build();

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertEquals("Email already exists", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_UsernameAlreadyExists_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role("HOSPITAL")
                .build();

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertEquals("Username already exists", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_InvalidRole_ThrowsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role("INVALID_ROLE")
                .build();

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertTrue(exception.getMessage().contains("Invalid role"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        User user = User.builder()
                .id(1L)
                .name("Test User")
                .username("testuser")
                .email("test@example.com")
                .password("hashed_password")
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken rt = invocation.getArgument(0);
            rt.setId(10L);
            return rt;
        });

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> userService.login(request));
    }

    @Test
    void login_PasswordMismatch_ThrowsException() {
        LoginRequest request = new LoginRequest("test@example.com", "wrong_password");
        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("hashed_password")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.login(request));
    }

    @Test
    void refreshAccessToken_Success() {
        String tokenStr = "mock-refresh-token";
        RefreshToken mockRefreshToken = RefreshToken.builder()
                .token(tokenStr)
                .userId(1L)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .revoked(false)
                .build();

        User user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockRefreshToken));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.refreshAccessToken(tokenStr);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertFalse(response.getToken().isEmpty());
        assertNotNull(response.getRefreshToken());

        verify(refreshTokenRepository, times(2)).findByToken(tokenStr);
    }

    @Test
    void logout_Success() {
        String tokenStr = "mock-refresh-token";
        RefreshToken mockRefreshToken = RefreshToken.builder()
                .token(tokenStr)
                .userId(1L)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockRefreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.logout(tokenStr);

        verify(refreshTokenRepository).findByToken(tokenStr);
        verify(refreshTokenRepository).save(mockRefreshToken);
        assertTrue(mockRefreshToken.isRevoked());
    }
}
