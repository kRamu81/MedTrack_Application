package com.medtrack.auth.service;

import com.medtrack.auth.dto.AuthResponse;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.dto.LoginResponse;
import com.medtrack.auth.dto.RegisterRequest;
import com.medtrack.auth.dto.UserResponse;
import com.medtrack.auth.model.User;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.exception.EmailAlreadyExistsException;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.LockedException;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.List;

import com.medtrack.auth.dto.ForgotPasswordRequest;
import com.medtrack.auth.dto.VerifyOtpRequest;
import com.medtrack.auth.dto.ResetPasswordRequest;
import com.medtrack.auth.model.PasswordResetToken;
import com.medtrack.auth.repository.PasswordResetTokenRepository;
import com.medtrack.auth.event.UserLoginEvent;
import com.medtrack.auth.event.UserRegisteredEvent;

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

    @Value("${app.jwt.expiration-ms:900000}")
    private long jwtExpirationMs;

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
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Value("${security.account.lock-duration:30}")
    private int lockDurationMinutes;

    @Value("${security.otp.length:6}")
    private int otpLength;

    @Value("${security.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

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
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Enforce email uniqueness constraint prior to registration
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Normalize the role string casing to uppercase for consistency in authorization checks; defaults to HOSPITAL
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "HOSPITAL";

        // Validate that the assigned role is mapped to one of the authorized application roles
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid role. Must be one of: HOSPITAL, TECHNICIAN, SUPPLIER");
        }

        // Normalize email to lowercase
        String email = request.getEmail().toLowerCase();

        // Generate unique username from email prefix
        String emailPrefix = email.split("@")[0];
        String username = emailPrefix;
        int count = 1;
        while (userRepository.existsByUsername(username)) {
            username = emailPrefix + count++;
        }

        // Map the RegisterRequest DTO to the User database entity and encode raw password
        User user = User.builder()
                .name(request.getName())
                .organization(request.getOrganization())
                .email(email)
                .phone(request.getPhone())
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        
        // Persist the user record to the database
        User savedUser = userRepository.save(user);

        // Publish UserRegisteredEvent
        UserRegisteredEvent registeredEvent = UserRegisteredEvent.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .timestamp(java.time.Instant.now().toString())
                .build();
        kafkaEventPublisher.publishUserRegistered(registeredEvent);

        // Map the persisted user to authentication response payload containing JWT token
        return mapToAuthResponse(savedUser, "Account created successfully");
    }

    /**
     * Authenticates an existing user by matching their login credentials against stored credentials.
     * <p>
     * Security notes:
     * <ul>
     *   <li>Email is normalised to lowercase before lookup to avoid case-sensitivity issues.</li>
     *   <li>A generic "Invalid credentials" error is returned for wrong email, wrong password,
     *       <em>and</em> wrong role so that callers cannot enumerate valid email addresses.</li>
     * </ul>
     *
     * @param loginRequest DTO containing the user's login email, plain-text password, and requested role
     * @return the {@link AuthResponse} containing the user profile and a signed JWT access token
     * @throws BadCredentialsException if credentials or role do not match
     */
    @Transactional(noRollbackFor = {BadCredentialsException.class, LockedException.class})
    public AuthResponse login(LoginRequest loginRequest) {
        // Normalize email to lowercase before lookup
        String normalizedEmail = loginRequest.getEmail().trim().toLowerCase();

        // Use a generic error message to avoid revealing whether the email exists (anti-enumeration)
        final BadCredentialsException invalidCredentials =
                new BadCredentialsException("Invalid credentials. Please check your email, password, and role.");

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> invalidCredentials);

        // Check if user account is locked
        if (user.getAccountStatus() == AccountStatus.LOCKED || user.getAccountLockedUntil() != null) {
            if (user.getAccountLockedUntil() != null && LocalDateTime.now().isAfter(user.getAccountLockedUntil())) {
                // Lock expired – perform automatic unlock
                user.setAccountStatus(AccountStatus.ACTIVE);
                user.setAccountLockedUntil(null);
                user.setFailedLoginAttempts(0);
                user = userRepository.save(user);
            } else {
                throw new LockedException("Account is temporarily locked. Please try again later.");
            }
        }

        // Verify role: compare the stored role against the requested role (both uppercased)
        String requestedRole = loginRequest.getRole().toUpperCase();
        if (!user.getRole().toUpperCase().equals(requestedRole)) {
            throw invalidCredentials;
        }

        // Verify password using bcrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            if (user.getAccountStatus() == AccountStatus.ACTIVE) {
                int newAttempts = user.getFailedLoginAttempts() + 1;
                if (newAttempts >= 5) {
                    user.setAccountStatus(AccountStatus.LOCKED);
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockDurationMinutes));
                    user.setFailedLoginAttempts(0);
                } else {
                    user.setFailedLoginAttempts(newAttempts);
                }
                userRepository.save(user);
            }
            throw invalidCredentials;
        }

        // Successful login: reset failed-attempt counters
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        user.setAccountStatus(AccountStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        // Publish UserLoginEvent
        UserLoginEvent loginEvent = UserLoginEvent.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .loginTime(java.time.Instant.now().toString())
                .build();
        kafkaEventPublisher.publishUserLogin(loginEvent);

        // Generate response payload containing user info and a new JWT token
        return mapToAuthResponse(savedUser, "Login successful");
    }


    /**
     * Helper mapping method to transform a {@link User} domain model entity into a response-friendly
     * DTO payload, generating a secure JWT token containing the user's authentication details.
     *
     * @param user the authenticated {@link User} entity
     * @param message the authentication success message to include
     * @return the fully populated {@link AuthResponse} object
     */
    private AuthResponse mapToAuthResponse(User user, String message) {
        // Request a new JWT token signed with user's ID, email and role claims
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .organization(user.getOrganization())
                .role(user.getRole())
                .build();

        // Build and return the response DTO
        return AuthResponse.builder()
                .success(true)
                .message(message)
                .user(userResponse)
                .token(token)
                // Legacy fields for flat object backwards-compatibility
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .refreshToken(refreshToken)
                .expiresIn(jwtExpirationMs)
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

        return mapToAuthResponse(user, "Token refreshed successfully");
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

    /**
     * Handles the forgot password workflow.
     * Verifies that the user exists, generates a secure random OTP, saves it in the database,
     * and sends it via the email service.
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Invalidate any existing unused OTP tokens for this email
        List<PasswordResetToken> activeTokens = passwordResetTokenRepository.findByEmailAndUsed(email, false);
        for (PasswordResetToken activeToken : activeTokens) {
            activeToken.setUsed(true);
        }
        passwordResetTokenRepository.saveAll(activeTokens);

        // Generate secure random numeric OTP
        SecureRandom random = new SecureRandom();
        StringBuilder otpBuilder = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otpBuilder.append(random.nextInt(10));
        }
        String otp = otpBuilder.toString();

        // Calculate expiry time
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        // Store OTP
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(expiryTime)
                .verified(false)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(token);

        // Send OTP via EmailService
        emailService.sendOtp(email, otp);
    }

    /**
     * Validates the OTP for the given email address.
     * Rejects expired, used, or incorrect OTPs and marks the OTP as verified.
     */
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp();

        // Find token by email and OTP
        PasswordResetToken token = passwordResetTokenRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Incorrect OTP"));

        // Reject if expired
        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Reject if used
        if (token.isUsed()) {
            throw new RuntimeException("OTP has already been used");
        }

        // Mark OTP as verified
        token.setVerified(true);
        passwordResetTokenRepository.save(token);
    }

    /**
     * Resets the user's password using the verified OTP.
     * Updates the password with BCrypt hashing and invalidates the OTP.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp();
        String newPassword = request.getNewPassword();

        // Verify OTP (find token by email and OTP)
        PasswordResetToken token = passwordResetTokenRepository.findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new RuntimeException("Incorrect OTP"));

        // Reject if not verified
        if (!token.isVerified()) {
            throw new RuntimeException("OTP has not been verified");
        }

        // Reject if expired
        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Reject if used
        if (token.isUsed()) {
            throw new RuntimeException("OTP has already been used");
        }

        // Get user and update password
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate OTP (mark as used)
        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        // Revoke all active sessions (refresh tokens) for the user
        refreshTokenService.revokeAllForUser(user.getId());
    }
}
