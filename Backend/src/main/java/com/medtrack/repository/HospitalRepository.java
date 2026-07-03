package com.medtrack.repository;

import com.medtrack.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    /**
     * Find a hospital profile by the associated user's ID.
     * @param userId the ID of the authenticated user
     * @return an Optional containing the Hospital if found
     */
    Optional<Hospital> findByUserId(Long userId);
}
