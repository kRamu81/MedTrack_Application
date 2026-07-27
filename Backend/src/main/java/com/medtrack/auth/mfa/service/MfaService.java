package com.medtrack.auth.mfa.service;

import com.medtrack.auth.mfa.dto.*;
import com.medtrack.auth.mfa.model.MfaSecret;
import com.medtrack.auth.mfa.repository.MfaSecretRepository;
import com.medtrack.auth.mfa.repository.UserSessionDeviceRepository;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing Multi-Factor Authentication (MFA / 2FA) setup,
 * TOTP verification algorithms, emergency backup recovery code processing,
 * and user security state management.
 */
@Service
@RequiredArgsConstructor
public class MfaService {

    private final MfaSecretRepository mfaSecretRepository;
    private final UserSessionDeviceRepository deviceRepository;
    private final UserRepository userRepository;

    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Initiates MFA setup by generating a unique 16-character Base32 TOTP secret key,
     * otpauth:// URI, and 8 emergency backup recovery codes.
     *
     * @param userId user identifier
     * @return {@link MfaSetupResponse} containing secret key, URI, and recovery codes
     */
    @Transactional
    public MfaSetupResponse setupMfa(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        String secretKey = generateBase32Secret(16);
        List<String> recoveryCodes = generateRecoveryCodes(8);
        String joinedCodes = String.join(",", recoveryCodes);

        MfaSecret mfaSecret = mfaSecretRepository.findByUserId(userId)
                .orElse(MfaSecret.builder().userId(userId).build());

        mfaSecret.setSecretKey(secretKey);
        mfaSecret.setEnabled(false); // Pending verification
        mfaSecret.setRecoveryCodes(joinedCodes);
        mfaSecret.setFailedAttempts(0);
        mfaSecretRepository.save(mfaSecret);

        String otpAuthUri = String.format(
                "otpauth://totp/MedTrack:%s?secret=%s&issuer=MedTrack",
                user.getEmail(),
                secretKey
        );

        return MfaSetupResponse.builder()
                .userId(userId)
                .secretKey(secretKey)
                .otpAuthUri(otpAuthUri)
                .recoveryCodes(recoveryCodes)
                .message("MFA secret key generated. Enter 6-digit TOTP code to confirm activation.")
                .build();
    }

    /**
     * Verifies TOTP code or backup recovery code to enable MFA or complete 2FA login step.
     *
     * @param request {@link MfaVerifyRequest} containing userId and 6-digit code or recovery string
     * @return {@code true} if verification succeeds, {@code false} otherwise
     */
    @Transactional
    public boolean verifyAndEnableMfa(MfaVerifyRequest request) {
        Long userId = request.getUserId();
        String code = request.getCode().trim();

        MfaSecret secret = mfaSecretRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("MFA is not configured for user ID: " + userId));

        // 1. Check if input is a valid TOTP code
        boolean isValidTotp = validateTotpCode(secret.getSecretKey(), code);

        if (isValidTotp) {
            secret.setEnabled(true);
            secret.setFailedAttempts(0);
            secret.setEnabledAt(LocalDateTime.now());
            secret.setLastVerifiedAt(LocalDateTime.now());
            mfaSecretRepository.save(secret);
            return true;
        }

        // 2. Check if code matches an emergency recovery code
        if (secret.getRecoveryCodes() != null && secret.getRecoveryCodes().contains(code)) {
            List<String> remainingCodes = Arrays.stream(secret.getRecoveryCodes().split(","))
                    .filter(c -> !c.equalsIgnoreCase(code))
                    .collect(Collectors.toList());

            secret.setRecoveryCodes(String.join(",", remainingCodes));
            secret.setEnabled(true);
            secret.setFailedAttempts(0);
            secret.setLastVerifiedAt(LocalDateTime.now());
            mfaSecretRepository.save(secret);
            return true;
        }

        // Increment failed attempts
        secret.setFailedAttempts(secret.getFailedAttempts() + 1);
        mfaSecretRepository.save(secret);
        return false;
    }

    /**
     * Disables Multi-Factor Authentication for a user account.
     *
     * @param userId user database primary key
     * @return true if successfully disabled
     */
    @Transactional
    public boolean disableMfa(Long userId) {
        Optional<MfaSecret> secretOpt = mfaSecretRepository.findByUserId(userId);
        if (secretOpt.isPresent()) {
            MfaSecret secret = secretOpt.get();
            secret.setEnabled(false);
            mfaSecretRepository.save(secret);
            return true;
        }
        return false;
    }

    /**
     * Checks current MFA configuration status for a user.
     *
     * @param userId user database primary key
     * @return {@link MfaStatusResponse} status overview
     */
    @Transactional(readOnly = true)
    public MfaStatusResponse getMfaStatus(Long userId) {
        Optional<MfaSecret> secretOpt = mfaSecretRepository.findByUserId(userId);
        int activeDevices = deviceRepository.findByUserIdAndActiveTrueOrderByLastAccessedAtDesc(userId).size();

        if (secretOpt.isEmpty()) {
            return MfaStatusResponse.builder()
                    .userId(userId)
                    .mfaEnabled(false)
                    .activeDeviceCount(activeDevices)
                    .message("MFA is not configured")
                    .build();
        }

        MfaSecret secret = secretOpt.get();
        return MfaStatusResponse.builder()
                .userId(userId)
                .mfaEnabled(secret.isEnabled())
                .enabledAt(secret.getEnabledAt())
                .lastVerifiedAt(secret.getLastVerifiedAt())
                .activeDeviceCount(activeDevices)
                .message(secret.isEnabled() ? "MFA is active and enabled" : "MFA setup incomplete")
                .build();
    }

    /**
     * Validates a TOTP code using RFC 6238 with HMAC-SHA1.
     * Checks the current 30-second window and the adjacent windows
     * to accommodate minor clock drift.
     */
    private boolean validateTotpCode(String secretKey, String code) {
        if (code == null || code.length() != 6 || !code.matches("\\d{6}")) {
            return false;
        }
        long currentTimeSeconds = System.currentTimeMillis() / 1000;
        long counter = currentTimeSeconds / 30;
        // Check current, previous, and next time windows for clock drift tolerance
        for (long offset = -1; offset <= 1; offset++) {
            String expected = generateTotp(secretKey, counter + offset);
            if (expected.equals(code)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generates a 6-digit TOTP code per RFC 6238 for a given Base32 secret and counter.
     */
    private String generateTotp(String base32Secret, long counter) {
        try {
            byte[] keyBytes = base32Decode(base32Secret);
            byte[] counterBytes = new byte[8];
            for (int i = 7; i >= 0; i--) {
                counterBytes[i] = (byte) (counter & 0xFF);
                counter >>= 8;
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
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Decodes a Base32-encoded string (RFC 4648) to a byte array.
     */
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

    /**
     * Helper to generate a random Base32 TOTP secret string.
     */
    private String generateBase32Secret(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE32_CHARS.charAt(RANDOM.nextInt(BASE32_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Helper to generate list of alphanumeric backup recovery codes.
     */
    private List<String> generateRecoveryCodes(int count) {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            codes.add(String.format("%04X-%04X", RANDOM.nextInt(0x10000), RANDOM.nextInt(0x10000)));
        }
        return codes;
    }
}
