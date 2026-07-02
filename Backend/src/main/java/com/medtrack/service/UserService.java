package com.medtrack.service;

import com.medtrack.dto.AuthResponse;
import com.medtrack.dto.LoginRequest;
import com.medtrack.model.User;
import com.medtrack.repository.UserRepository;
import com.medtrack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class handling user registration, authentication verification,
 * and security token generation.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user in the system after verifying that the email is unique.
     * Encrypts the user's password prior to persistence.
     */
    public AuthResponse register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Encrypt the plain text password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        return mapToAuthResponse(savedUser);
    }

    /**
     * Validates credentials for user login and returns authentication details.
     */
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Match input password against encrypted password in db
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
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
                .build();
    }
}
