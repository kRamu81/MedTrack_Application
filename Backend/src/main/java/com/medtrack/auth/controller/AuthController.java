package com.medtrack.auth.controller;

import com.medtrack.auth.dto.AuthResponse;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.dto.RefreshTokenRequest;
import com.medtrack.auth.dto.RegisterRequest;
import com.medtrack.auth.dto.ForgotPasswordRequest;
import com.medtrack.auth.dto.VerifyOtpRequest;
import com.medtrack.auth.dto.ResetPasswordRequest;
import com.medtrack.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Controller exposing endpoints for user session lifecycles and recovery workflows.
 * Mapped under "/api/auth" to process registrations, logins, token rotation, and password resets.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, logout, and password recovery workflows.")
public class AuthController {

    private final UserService userService;

    /**
     * Registers a new user within the database.
     * Persists hashed credentials, triggers downstream events (e.g. Kafka event triggers),
     * and returns initial authorization credentials.
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Creates a new user profile in the database, generates JWT/refresh tokens, and publishes a UserRegisteredEvent to Kafka.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User successfully registered and authenticated", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid registration details or email already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(registerRequest));
    }

    /**
     * Authenticates credentials matching a registered identity profile.
     * Verifies username, hashed password matches, and system access role claims.
     * Resets failed login attempt counts upon successful processing.
     */
    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Validates user email, password, and role. Resets failed login attempts and returns active access/refresh tokens.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully logged in and authenticated", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Invalid credentials, wrong role, or temporarily locked account")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    /**
     * Rotates refresh tokens and issues fresh short-lived access tokens.
     * Implements rotation patterns to invalidate previous refresh credentials to prevent replay.
     */
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access and rotation tokens", description = "Revokes the supplied refresh token, rotates security tokens, and returns a new access token pairing.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tokens rotated successfully", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Expired or invalid refresh token supplied")
    })
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(userService.refreshAccessToken(request.getRefreshToken()));
    }

    /**
     * Revokes active refresh token sessions to securely log out users.
     */
    @PostMapping("/logout")
    @Operation(summary = "Revoke session and log out", description = "Invalidates the active refresh token session, revoking access.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Successfully logged out and token invalidated"),
        @ApiResponse(responseCode = "400", description = "Token validation failed")
    })
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        userService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    /**
     * Begins account password recovery sequence.
     * Generates a secure, temporary 6-digit verification pin and sends it via email.
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate forgot password workflow", description = "Validates the user email and emails a 6-digit verification OTP valid for 10 minutes.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OTP generated and emailed successfully"),
        @ApiResponse(responseCode = "400", description = "No user found with the registered email address")
    })
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    /**
     * Validates verification pin validity against recovery session status.
     */
    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP code", description = "Validates the 6-digit OTP code against the user's active recovery session.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OTP code verified successfully"),
        @ApiResponse(responseCode = "400", description = "Incorrect, expired, or already utilized OTP code")
    })
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        userService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    /**
     * Overwrites user password using a pre-validated verification pin recovery state.
     * Marks the verification pin as consumed upon successful replacement to prevent replay.
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Reset account password", description = "Replaces the password using a verified OTP. The OTP is marked as used.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset completed successfully"),
        @ApiResponse(responseCode = "400", description = "OTP has not been verified or expired")
    })
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
