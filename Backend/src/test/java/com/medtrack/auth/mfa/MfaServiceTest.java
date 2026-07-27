package com.medtrack.auth.mfa;

import com.medtrack.auth.mfa.dto.*;
import com.medtrack.auth.mfa.model.MfaSecret;
import com.medtrack.auth.mfa.repository.MfaSecretRepository;
import com.medtrack.auth.mfa.repository.UserSessionDeviceRepository;
import com.medtrack.auth.mfa.service.MfaService;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link MfaService}.
 * Validates TOTP secret generation, recovery code verification, MFA status checks, and disabling.
 */
@ExtendWith(MockitoExtension.class)
public class MfaServiceTest {

    @Mock
    private MfaSecretRepository mfaSecretRepository;

    @Mock
    private UserSessionDeviceRepository deviceRepository;

    @Mock
    private UserRepository userRepository;

    private MfaService mfaService;
    private User testUser;

    @BeforeEach
    void setUp() {
        mfaService = new MfaService(mfaSecretRepository, deviceRepository, userRepository);

        testUser = User.builder()
                .id(200L)
                .username("mfatest")
                .email("mfa@medtrack.org")
                .build();
    }

    @Test
    void setupMfa_Success() {
        when(userRepository.findById(200L)).thenReturn(Optional.of(testUser));
        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.empty());

        MfaSetupResponse response = mfaService.setupMfa(200L);

        assertNotNull(response);
        assertEquals(200L, response.getUserId());
        assertNotNull(response.getSecretKey());
        assertEquals(16, response.getSecretKey().length());
        assertTrue(response.getOtpAuthUri().contains("mfa@medtrack.org"));
        assertEquals(8, response.getRecoveryCodes().size());

        verify(mfaSecretRepository).save(any(MfaSecret.class));
    }

    @Test
    void verifyAndEnableMfa_WithValidCode_ReturnsTrue() throws Exception {
        MfaSecret secret = MfaSecret.builder()
                .userId(200L)
                .secretKey("JBSWY3DPEHPK3PXP")
                .enabled(false)
                .build();

        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.of(secret));

        // Compute the valid TOTP code for the test secret at the current time window
        String validCode = generateTotp("JBSWY3DPEHPK3PXP", System.currentTimeMillis() / 1000 / 30);

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(200L)
                .code(validCode)
                .build();

        boolean verified = mfaService.verifyAndEnableMfa(request);

        assertTrue(verified);
        assertTrue(secret.isEnabled());
        verify(mfaSecretRepository).save(secret);
    }

    /**
     * Generates RFC 6238 TOTP code for test verification.
     */
    private String generateTotp(String base32Secret, long counter) throws Exception {
        byte[] keyBytes = base32Decode(base32Secret);
        byte[] counterBytes = new byte[8];
        long c = counter;
        for (int i = 7; i >= 0; i--) {
            counterBytes[i] = (byte) (c & 0xFF);
            c >>= 8;
        }
        Mac hmac = Mac.getInstance("HmacSHA1");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "HmacSHA1");
        hmac.init(keySpec);
        byte[] hash = hmac.doFinal(counterBytes);
        int offset = hash[hash.length - 1] & 0x0F;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);
        int otp = binary % 1000000;
        return String.format("%06d", otp);
    }

    private byte[] base32Decode(String base32) {
        String cleaned = base32.replaceAll("=", "").toUpperCase();
        int byteLength = cleaned.length() * 5 / 8;
        byte[] result = new byte[byteLength];
        int buffer = 0, bitsLeft = 0, index = 0;
        for (char c : cleaned.toCharArray()) {
            int value;
            if (c >= 'A' && c <= 'Z') {
                value = c - 'A';
            } else if (c >= '2' && c <= '7') {
                value = c - '2' + 26;
            } else {
                continue;
            }
            buffer = (buffer << 5) | value;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                result[index++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }
        return result;
    }

    @Test
    void verifyAndEnableMfa_WithRecoveryCode_ConsumesCodeAndReturnsTrue() {
        MfaSecret secret = MfaSecret.builder()
                .userId(200L)
                .secretKey("JBSWY3DPEHPK3PXP")
                .enabled(true)
                .recoveryCodes("A1B2-C3D4,E5F6-G7H8")
                .build();

        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.of(secret));

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(200L)
                .code("A1B2-C3D4")
                .build();

        boolean verified = mfaService.verifyAndEnableMfa(request);

        assertTrue(verified);
        assertEquals("E5F6-G7H8", secret.getRecoveryCodes());
        verify(mfaSecretRepository).save(secret);
    }

    @Test
    void verifyAndEnableMfa_InvalidCode_ReturnsFalse() {
        MfaSecret secret = MfaSecret.builder()
                .userId(200L)
                .secretKey("JBSWY3DPEHPK3PXP")
                .enabled(false)
                .failedAttempts(0)
                .build();

        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.of(secret));

        MfaVerifyRequest request = MfaVerifyRequest.builder()
                .userId(200L)
                .code("000000")
                .build();

        boolean verified = mfaService.verifyAndEnableMfa(request);

        assertFalse(verified);
        assertEquals(1, secret.getFailedAttempts());
    }

    @Test
    void getMfaStatus_Enabled_ReturnsStatus() {
        MfaSecret secret = MfaSecret.builder()
                .userId(200L)
                .enabled(true)
                .build();

        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.of(secret));
        when(deviceRepository.findByUserIdAndActiveTrueOrderByLastAccessedAtDesc(200L)).thenReturn(List.of());

        MfaStatusResponse response = mfaService.getMfaStatus(200L);

        assertNotNull(response);
        assertTrue(response.isMfaEnabled());
        assertEquals(0, response.getActiveDeviceCount());
    }

    @Test
    void disableMfa_Success() {
        MfaSecret secret = MfaSecret.builder()
                .userId(200L)
                .enabled(true)
                .build();

        when(mfaSecretRepository.findByUserId(200L)).thenReturn(Optional.of(secret));

        boolean disabled = mfaService.disableMfa(200L);

        assertTrue(disabled);
        assertFalse(secret.isEnabled());
        verify(mfaSecretRepository).save(secret);
    }
}
