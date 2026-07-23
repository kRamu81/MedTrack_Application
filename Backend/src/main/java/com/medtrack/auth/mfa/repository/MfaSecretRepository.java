package com.medtrack.auth.mfa.repository;

import com.medtrack.auth.mfa.model.MfaSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA Repository for managing persistent MFA user secret entities.
 */
@Repository
public interface MfaSecretRepository extends JpaRepository<MfaSecret, Long> {

    /**
     * Finds MFA secret details for a specific user ID.
     *
     * @param userId target user ID
     * @return Optional containing MfaSecret if configured
     */
    Optional<MfaSecret> findByUserId(Long userId);

    /**
     * Checks if a user has active enabled MFA.
     *
     * @param userId user identifier
     * @return true if enabled, false otherwise
     */
    boolean existsByUserIdAndEnabledTrue(Long userId);
}
