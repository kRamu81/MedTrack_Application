package com.medtrack.auth.service;

import com.medtrack.auth.dto.ForgotPasswordRequest;
import com.medtrack.auth.dto.ResetPasswordRequest;
import com.medtrack.auth.dto.VerifyOtpRequest;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.model.PasswordResetToken;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.PasswordResetTokenRepository;
import com.medtrack.auth.repository.RefreshTokenRepository;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PasswordResetTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private KafkaEventPublisher kafkaEventPublisher;

    private final JwtUtil jwtUtil = new JwtUtil();
    private RefreshTokenService refreshTokenService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationDays", 7L);
        userService = new UserService(
                userRepository,
                passwordEncoder,
                jwtUtil,
                refreshTokenService,
                authenticationManager,
                passwordResetTokenRepository,
                emailService,
                kafkaEventPublisher
        );
        ReflectionTestUtils.setField(userService, "otpLength", 6);
        ReflectionTestUtils.setField(userService, "otpExpiryMinutes", 10);
    }

    @Test
    void forgotPassword_Success() {
        String email = "test@example.com";
        ForgotPasswordRequest request = new ForgotPasswordRequest(email);

        User user = User.builder()
                .id(1L)
                .email(email)
                .name("Test User")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findByEmailAndUsed(email, false)).thenReturn(java.util.Collections.emptyList());
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        userService.forgotPassword(request);

        // Verify OTP token is stored
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken token = tokenCaptor.getValue();

        assertNotNull(token);
        assertEquals(email, token.getEmail());
        assertEquals(6, token.getOtp().length());
        assertFalse(token.isVerified());
        assertFalse(token.isUsed());
        assertTrue(token.getExpiryTime().isAfter(LocalDateTime.now()));

        // Verify email service is called with the correct OTP
        verify(emailService).sendOtp(eq(email), eq(token.getOtp()));
    }

    @Test
    void forgotPassword_UserNotFound_ThrowsException() {
        String email = "unknown@example.com";
        ForgotPasswordRequest request = new ForgotPasswordRequest(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.forgotPassword(request));
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendOtp(any(), any());
    }

    @Test
    void verifyOtp_Success() {
        String email = "test@example.com";
        String otp = "123456";
        VerifyOtpRequest request = new VerifyOtpRequest(email, otp);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .verified(false)
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.of(token));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        userService.verifyOtp(request);

        assertTrue(token.isVerified());
        verify(passwordResetTokenRepository).save(token);
    }

    @Test
    void verifyOtp_IncorrectOtp_ThrowsException() {
        String email = "test@example.com";
        String otp = "123456";
        VerifyOtpRequest request = new VerifyOtpRequest(email, otp);

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.verifyOtp(request));
        assertEquals("Incorrect OTP", ex.getMessage());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void verifyOtp_ExpiredOtp_ThrowsException() {
        String email = "test@example.com";
        String otp = "123456";
        VerifyOtpRequest request = new VerifyOtpRequest(email, otp);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().minusMinutes(1)) // Expired
                .verified(false)
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.of(token));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.verifyOtp(request));
        assertEquals("OTP has expired", ex.getMessage());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void verifyOtp_UsedOtp_ThrowsException() {
        String email = "test@example.com";
        String otp = "123456";
        VerifyOtpRequest request = new VerifyOtpRequest(email, otp);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .verified(true)
                .used(true) // Already used
                .build();

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.of(token));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.verifyOtp(request));
        assertEquals("OTP has already been used", ex.getMessage());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void resetPassword_Success() {
        String email = "test@example.com";
        String otp = "123456";
        String newPassword = "newPassword123";
        ResetPasswordRequest request = new ResetPasswordRequest(email, otp, newPassword);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .verified(true) // Must be verified
                .used(false)
                .build();

        User user = User.builder()
                .id(1L)
                .email(email)
                .password("old_encoded_password")
                .build();

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn("new_encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        userService.resetPassword(request);

        assertEquals("new_encoded_password", user.getPassword());
        assertTrue(token.isUsed());
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
        verify(refreshTokenRepository).deleteByUserId(user.getId());
    }

    @Test
    void resetPassword_UnverifiedOtp_ThrowsException() {
        String email = "test@example.com";
        String otp = "123456";
        String newPassword = "newPassword123";
        ResetPasswordRequest request = new ResetPasswordRequest(email, otp, newPassword);

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .verified(false) // NOT verified
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByEmailAndOtp(email, otp)).thenReturn(Optional.of(token));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.resetPassword(request));
        assertEquals("OTP has not been verified", ex.getMessage());
        verify(userRepository, never()).save(any());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    void forgotPassword_InvalidatesOldTokens() {
        String email = "test@example.com";
        ForgotPasswordRequest request = new ForgotPasswordRequest(email);

        User user = User.builder()
                .id(1L)
                .email(email)
                .name("Test User")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        PasswordResetToken oldToken = PasswordResetToken.builder()
                .email(email)
                .otp("654321")
                .used(false)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findByEmailAndUsed(email, false))
                .thenReturn(new java.util.ArrayList<>(java.util.List.of(oldToken)));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        userService.forgotPassword(request);

        assertTrue(oldToken.isUsed());
        verify(passwordResetTokenRepository).saveAll(any());
    }

    @Test
    void forgotPassword_NormalizesEmail_Success() {
        String email = " Test@Example.Com ";
        String normalizedEmail = "test@example.com";
        ForgotPasswordRequest request = new ForgotPasswordRequest(email);

        User user = User.builder()
                .id(1L)
                .email(normalizedEmail)
                .name("Test User")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findByEmailAndUsed(normalizedEmail, false)).thenReturn(java.util.Collections.emptyList());
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        userService.forgotPassword(request);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken token = tokenCaptor.getValue();

        assertEquals(normalizedEmail, token.getEmail());
        verify(userRepository).findByEmail(normalizedEmail);
    }
}
