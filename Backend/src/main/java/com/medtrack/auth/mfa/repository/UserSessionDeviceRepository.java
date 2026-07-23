package com.medtrack.auth.mfa.repository;

import com.medtrack.auth.mfa.model.UserSessionDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for managing active user device session tracking entities.
 */
@Repository
public interface UserSessionDeviceRepository extends JpaRepository<UserSessionDevice, Long> {

    /**
     * Finds all active device sessions for a given user.
     *
     * @param userId target user ID
     * @return list of active device entities
     */
    List<UserSessionDevice> findByUserIdAndActiveTrueOrderByLastAccessedAtDesc(Long userId);

    /**
     * Finds all device records (active and revoked) for a user.
     *
     * @param userId target user ID
     * @return list of all device session records
     */
    List<UserSessionDevice> findByUserIdOrderByLastAccessedAtDesc(Long userId);

    /**
     * Finds a specific device by userId and unique device fingerprint ID.
     *
     * @param userId user identifier
     * @param deviceId unique device fingerprint
     * @return Optional device session entity
     */
    Optional<UserSessionDevice> findByUserIdAndDeviceId(Long userId, String deviceId);
}
