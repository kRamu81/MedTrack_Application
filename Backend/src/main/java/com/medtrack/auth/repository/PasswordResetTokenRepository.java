package com.medtrack.auth.repository;

import com.medtrack.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * PasswordResetTokenRepository provides data access operations for the {@link PasswordResetToken} entity.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Finds a password reset token by email and OTP code.
     *
     * @param email the email address
     * @param otp the OTP code
     * @return an {@link Optional} containing the matched {@link PasswordResetToken} if found
     */
    Optional<PasswordResetToken> findByEmailAndOtp(String email, String otp);

    /**
     * Finds password reset tokens by email and used status.
     *
     * @param email the email address
     * @param used the usage status
     * @return a {@link java.util.List} of matching {@link PasswordResetToken} entities
     */
    java.util.List<PasswordResetToken> findByEmailAndUsed(String email, boolean used);

    /**
     * Finds the latest password reset token for a given email address.
     *
     * @param email the email address
     * @return an {@link Optional} containing the latest {@link PasswordResetToken} if found
     */
    Optional<PasswordResetToken> findFirstByEmailOrderByCreatedAtDesc(String email);
}
