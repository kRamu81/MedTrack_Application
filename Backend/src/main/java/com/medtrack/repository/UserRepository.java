package com.medtrack.repository;

import com.medtrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository - Database access for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Used for login - find by email */
    Optional<User> findByEmail(String email);

    /** Check if email is already registered */
    boolean existsByEmail(String email);
}
