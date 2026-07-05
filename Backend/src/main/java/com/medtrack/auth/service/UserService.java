package com.medtrack.auth.service;

import com.medtrack.auth.dto.AuthResponse;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class handling user registration, authentication verification,
 * and security token generation.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private static final List<String> VALID_ROLES = List.of("HOSPITAL", "TECHNICIAN", "SUPPLIER");

    // Must match JwtUtil.EXPIRATION_MS so the value reported to the client is accurate
    private static final long TOKEN_EXPIRATION_MS = 1000 * 60 * 60 * 24;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user in the system after verifying that the email is unique
     * and the role is valid. Encrypts the user's password prior to persistence.
     */
    public AuthResponse register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (user.getRole() == null || !VALID_ROLES.contains(user.getRole().toUpperCase())) {
            throw new RuntimeException("Invalid role. Must be one of: HOSPITAL, TECHNICIAN, SUPPLIER");
        }

        // Normalize role casing before saving
        user.setRole(user.getRole().toUpperCase());

        // Encrypt the plain text password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        return mapToAuthResponse(savedUser);
    }

    /**
     * Validates credentials for user login and returns authentication details.
     * Throws BadCredentialsException (mapped to HTTP 401) on any auth failure.
     */
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Match input password against encrypted password in db
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return mapToAuthResponse(user);
    }

    /**
     * Maps the User entity to an AuthResponse DTO and generates a JWT token.
     */
    private AuthResponse mapToAuthResponse(User user) {
        // Generate JWT token containing email and role claims
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .expiresIn(TOKEN_EXPIRATION_MS)
                .build();
    }
}
