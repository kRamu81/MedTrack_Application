package com.medtrack.auth.repository;

import com.medtrack.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository provides data access operations for the {@link User} entity.
 * It extends {@link JpaRepository} to inherit default CRUD operations and pagination support,
 * and declares custom query methods to look up users by their unique email addresses.
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Repository}: Marks this interface as a Spring-managed repository bean that executes database operations.</li>
 * </ul>
 * </p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Retrieves a user from the database matching the specified email address.
     * This query is commonly used during user authentication/login workflows to load the user profile.
     *
     * @param email the email address of the user to search for
     * @return an {@link Optional} containing the matched {@link User} entity if found, or {@link Optional#empty()} if no match exists
     */
    Optional<User> findByEmail(String email);

    /**
     * Retrieves a user from the database matching the specified username.
     *
     * @param username the username of the user to search for
     * @return an {@link Optional} containing the matched {@link User} entity if found, or {@link Optional#empty()} if no match exists
     */
    Optional<User> findByUsername(String username);

    /**
     * Checks if a user already exists in the database with the given email address.
     * This query is typically used during user registration to ensure email addresses remain globally unique.
     *
     * @param email the email address to check for existence
     * @return {@code true} if a user record exists with the specified email, {@code false} otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Checks if a user already exists in the database with the given username.
     *
     * @param username the username to check for existence
     * @return {@code true} if a user record exists with the specified username, {@code false} otherwise
     */
    boolean existsByUsername(String username);
}
