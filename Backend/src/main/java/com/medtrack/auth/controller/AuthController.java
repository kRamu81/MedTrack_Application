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
 * AuthController exposes the REST endpoints for user authentication operations,
 * specifically handling new user registration, user login, token refresh, and logout requests.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, logout, and password recovery workflows.")
public class AuthController {

    private final UserService userService;

    /**
     * Registers a new user within the application database.
     *
     * @param registerRequest the {@link RegisterRequest} DTO.
     * @return a {@link ResponseEntity} wrapping the {@link AuthResponse}.
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
     * Authenticates an existing user using their email, password, and role.
     *
     * @param loginRequest the {@link LoginRequest} DTO.
     * @return a {@link ResponseEntity} wrapping the {@link AuthResponse}.
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
     * Issues a new access token and a rotated refresh token using a valid refresh token.
     *
     * @param request the request DTO containing the current refresh token
     * @return the {@link AuthResponse} containing the new tokens
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
     * Revokes the provided refresh token, performing a user logout.
     *
     * @param request the request DTO containing the refresh token to revoke
     * @return HTTP 204 No Content
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
     * Initiates the forgot password workflow by generating and sending an OTP to the user's email.
     *
     * @param request the {@link ForgotPasswordRequest} DTO
     * @return a success response message
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
     * Verifies the provided OTP code.
     *
     * @param request the {@link VerifyOtpRequest} DTO
     * @return a success response message
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
     * Resets the password using a verified OTP.
     *
     * @param request the {@link ResetPasswordRequest} DTO
     * @return a success response message
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
