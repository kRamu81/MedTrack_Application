package com.medtrack.auth.service;

import com.medtrack.auth.model.RefreshToken;
import com.medtrack.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * RefreshTokenService manages the lifecycle of refresh tokens, including creation,
 * verification, and revocation.
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Service}: Marks this class as a Spring service.</li>
 *   <li>{@code @RequiredArgsConstructor}: Autowires dependencies via constructor injection.</li>
 *   <li>{@code @Transactional(readOnly = true)}: Ensures read-only transactions by default for query operations.</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Refresh token validity duration configured in properties (defaults to 7 days).
     */
    @Value("${app.jwt.refresh-expiration-days:7}")
    private long refreshExpirationDays;

    /**
     * Creates and persists a new refresh token for the given user.
     * Note: Previous refresh tokens are not automatically deleted here.
     *
     * @param userId the user's ID
     * @return the saved {@link RefreshToken}
     */
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        // Build the new RefreshToken using Lombok builder with a random UUID token and configured expiration duration
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusDays(refreshExpirationDays))
                .revoked(false)
                .build();
        // Persist the token entity to database storage and return the saved instance
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validates a refresh token by checking existence, revocation status, and expiration.
     * Throws BadCredentialsException if verification fails (handled by global exception handler).
     *
     * @param token the token string to verify
     * @return the verified {@link RefreshToken} entity
     * @throws BadCredentialsException if the token is invalid, revoked, or expired
     */
    public RefreshToken verifyToken(String token) {
        // Retrieve the token from database or throw a BadCredentialsException if not found
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        // Check if the token has been manually marked as revoked
        if (refreshToken.isRevoked()) {
            throw new BadCredentialsException("Refresh token has been revoked. Please log in again.");
        }

        // Check if the current timestamp is past the token's expiration date
        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Refresh token has expired. Please log in again.");
        }

        return refreshToken;
    }

    /**
     * Revokes a single refresh token (e.g. on logout).
     *
     * @param token the token to revoke
     */
    @Transactional
    public void revokeToken(String token) {
        // Look up the token in the database; if present, set revoked to true and save changes
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    /**
     * Revokes ALL refresh tokens belonging to a user (e.g. logout everywhere or password reset).
     *
     * @param userId the user's ID
     */
    @Transactional
    public void revokeAllForUser(Long userId) {
        // Delete all tokens mapped to the user ID in a single database transaction
        refreshTokenRepository.deleteByUserId(userId);
    }
}
