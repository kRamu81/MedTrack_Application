package com.medtrack.auth.service;

import com.medtrack.auth.dto.AuthResponse;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.dto.RegisterRequest;
import com.medtrack.auth.model.User;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * UserService encapsulates the business logic for user management, credential validation,
 * account registration, and authentication token provisioning.
 *
 * <p>Key features:
 * <ul>
 *   <li><strong>User Registration:</strong> Validates role compatibility, email uniqueness, and encrypts plain text passwords.</li>
 *   <li><strong>User Authentication:</strong> Validates user credentials against encrypted stored hash values.</li>
 *   <li><strong>Token Provisioning:</strong> Delegates to {@link JwtUtil} to issue JWT tokens with appropriate role-based authorization claims.</li>
 * </ul>
 * </p>
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Service}: Marks this class as a Spring service component to indicate it holds business logic.</li>
 *   <li>{@code @RequiredArgsConstructor}: Lombok annotation generating a constructor for all {@code final} fields, facilitating Dependency Injection.</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class UserService {

    /**
     * List of acceptable security roles within the application system.
     * Roles must match authorized paths configured in security configurations.
     */
    private static final List<String> VALID_ROLES = List.of("HOSPITAL", "TECHNICIAN", "SUPPLIER");

    /**
     * Token lifetime in milliseconds. This value must correspond directly with {@link JwtUtil#EXPIRATION_MS}
     * to keep client-side session timeout synchronization synchronization accurate.
     */
    private static final long TOKEN_EXPIRATION_MS = 1000 * 60 * 15;

    /**
     * Repository interface for performing CRUD operations on the User table.
     */
    private final UserRepository userRepository;

    /**
     * Password encoder used to secure raw credentials via cryptographic hashing before database persistence.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Utility component used to sign and build JWT tokens for authenticated users.
     */
    private final JwtUtil jwtUtil;

    /**
     * Service responsible for managing database-backed refresh tokens.
     */
    private final RefreshTokenService refreshTokenService;

    /**
     * Registers a new user account in the application database.
     * Enforces unique email check and valid system role assignment, then encodes the password using BCrypt.
     *
     * @param request the registration details DTO
     * @return the {@link AuthResponse} containing user profile information and generated JWT token
     * @throws RuntimeException if the email already exists in the database or if an invalid role is provided
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Enforce username uniqueness constraint prior to registration
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Enforce email uniqueness constraint prior to registration
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Normalize the role string casing to uppercase for consistency in authorization checks; defaults to HOSPITAL
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "HOSPITAL";

        // Validate that the assigned role is mapped to one of the authorized application roles
        if (!VALID_ROLES.contains(role)) {
            throw new RuntimeException("Invalid role. Must be one of: HOSPITAL, TECHNICIAN, SUPPLIER");
        }

        // Map the RegisterRequest DTO to the User database entity and encode raw password
        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        
        // Persist the user record to the database
        User savedUser = userRepository.save(user);

        // Map the persisted user to authentication response payload containing JWT token
        return mapToAuthResponse(savedUser);
    }

    /**
     * Authenticates an existing user by matching their login credentials against stored credentials.
     *
     * @param loginRequest DTO containing the user's login email and plain text password
     * @return the {@link AuthResponse} containing user profile information and generated JWT token
     * @throws BadCredentialsException if the email address does not exist or if the passwords do not match
     */
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        // Retrieve user by email or throw a BadCredentialsException to protect system metadata details
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Match the submitted password against the encrypted hash stored in database
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate response payload containing user info and a new JWT token
        return mapToAuthResponse(user);
    }

    /**
     * Helper mapping method to transform a {@link User} domain model entity into a response-friendly
     * DTO payload, generating a secure JWT token containing the user's authentication details.
     *
     * @param user the authenticated {@link User} entity
     * @return the fully populated {@link AuthResponse} object
     */
    private AuthResponse mapToAuthResponse(User user) {
        // Request a new JWT token signed with user's email and role claims
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

        // Build and return the response DTO
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .refreshToken(refreshToken)
                .expiresIn(TOKEN_EXPIRATION_MS)
                .build();
    }

    /**
     * Issues a new access token (and rotates the refresh token) given a valid refresh token.
     *
     * @param requestRefreshToken the refresh token submitted by the client
     * @return the new {@link AuthResponse} containing rotated tokens
     */
    @Transactional
    public AuthResponse refreshAccessToken(String requestRefreshToken) {
        var refreshToken = refreshTokenService.verifyToken(requestRefreshToken);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rotate: revoke old refresh token, issue a brand new one
        refreshTokenService.revokeToken(requestRefreshToken);

        return mapToAuthResponse(user);
    }

    /**
     * Logs the user out by revoking the specified refresh token.
     *
     * @param refreshToken the refresh token to revoke
     */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
    }
}
