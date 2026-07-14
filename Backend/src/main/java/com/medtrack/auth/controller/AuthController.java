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
 * =================================================================================================
 * ENTERPRISE AUTHENTICATION & REST ENDPOINT CONTROLLER (AuthController)
 * =================================================================================================
 *
 * SECTION 1: ARCHITECTURAL OVERVIEW & SECURITY CONTEXT
 * This controller serves as the primary gateway for identity management, user enrollment, and session
 * authorization in the MedTrack ecosystem. Operating at the boundary of the application's network
 * layer, it exposes a set of RESTful APIs to facilitate token-based authentication workflows.
 * In modern cloud-native architectures, authentication is decoupled from downstream microservices;
 * however, this controller acts as the dedicated auth authority.
 *
 * The architecture relies on stateless JSON Web Tokens (JWT) for access validation and database-backed
 * Refresh Tokens for session persistence and sliding window token renewal. All communication must
 * strictly occur over Transport Layer Security (TLS/HTTPS) in production environments to mitigate
 * Man-in-the-Middle (MitM) attacks, token sniffing, and replay attacks.
 *
 * SECTION 2: SPRING SECURITY INTEGRATION & CORS POLICIES
 * As a Spring @RestController, this class participates in the WebMvc tier. It is mapped under
 * "/api/auth". Spring Security filters intercepts requests, but endpoints in this controller are
 * generally configured to bypass global authorization checks (i.e., permitted to "permitAll") via
 * SecurityFilterChain configurations, allowing unauthenticated clients to register or log in.
 *
 * CORS (Cross-Origin Resource Sharing) is configured via @CrossOrigin for "http://localhost:3000".
 * In enterprise setups, rather than hardcoding origin domains, origins are dynamically loaded from
 * externalized YAML profiles (e.g., application-prod.yml) to ensure environmental parity and security
 * compliance, restricting browser-based access only to white-listed client applications.
 *
 * SECTION 3: API SPECIFICATION AND OPENAPI ANNOTATIONS
 * The endpoints are annotated with Swagger/OpenAPI metadata (@Tag, @Operation, @ApiResponses, etc.).
 * These annotations generate structural metadata consumed by API gateways, developer portals,
 * and client-side SDK generators. This decouples the service interface details from the physical
 * implementation and keeps the API contract clear.
 *
 * SECTION 4: THREAT MITIGATION AND DATA INTEGRITY
 * 1. Payload Validation: Incoming requests are validated at the controller entrance using Jakarta
 *    Validation annotations (@Valid). This prevents processing malformed or malicious payloads (e.g.,
 *    SQL Injection, Cross-Site Scripting payloads in user inputs, and extremely long text parameters).
 * 2. Sensitive Data Handling: Password fields are transmitted securely in HTTP POST request bodies
 *    rather than URL query parameters to avoid logging credentials in reverse proxies, load balancers,
 *    and application server logs.
 * 3. Rate Limiting (Recommended): While not implemented directly within this Controller class, a rate
 *    limiting filter (e.g., Bucket4j or API Gateway rate-limiting) should protect these endpoints to
 *    prevent Denial of Service (DoS) and brute-force password guessing.
 *
 * SECTION 5: EVENT-DRIVEN NOTIFICATIONS
 * Certain actions, such as registration and forgot-password initiation, trigger asynchronous events.
 * For example, registering a user publishes messages to Kafka topics, ensuring high throughput and
 * decoupling core authentication from secondary tasks such as sending welcome emails, setting up
 * user workspaces, or updating analytical databases.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, logout, and password recovery workflows.")
public class AuthController {

    /**
     * =============================================================================================
     * INJECTED DEPENDENCIES
     * =============================================================================================
     *
     * The UserService encapsulates the core business logic, database transactions, password hashing,
     * token creation/validation, and messaging events (Kafka/SMTP). By injecting UserService as a
     * final field and leveraging Lombok's @RequiredArgsConstructor, we enforce constructor-based
     * dependency injection (DI). Constructor-based DI is the preferred enterprise pattern because:
     * 1. It ensures the class cannot be instantiated in an uninitialized state.
     * 2. It simplifies unit testing by allowing easy mocking without reflection.
     * 3. It guarantees immutability of the service reference during runtime.
     */
    private final UserService userService;

    /**
     * =============================================================================================
     * ENDPOINT: USER REGISTRATION (POST /api/auth/register)
     * =============================================================================================
     *
     * PURPOSE:
     * Enrolls a new user account in the application database. Upon successful validation of inputs
     * and ensuring email uniqueness, the system persists the user profile, encrypts the password
     * (using BCrypt/Argon2 via the service layer), publishes an integration event to Apache Kafka,
     * and immediately issues a valid set of JWT access and refresh tokens.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * In enterprise software, user enrollment is a critical write operation that must be transactional.
     * The underlying service method is annotated with Spring's @Transactional. If any downstream
     * operation fails (such as database persistence or token generation), the transaction is rolled
     * back, ensuring database consistency.
     *
     * SECURITY CONSIDERATIONS:
     * - Password Hashing: Plaintext passwords MUST NEVER be stored in the database. The UserService
     *   delegates to a PasswordEncoder bean (typically BCrypt with a strength factor of 10 or 12)
     *   prior to persistence.
     * - Input Sanitization: The RegisterRequest DTO must use @NotNull, @Email, and @Size constraints
     *   to reject weak passwords and invalid email formats at the controller interface before they
     *   reach the database engine.
     * - Duplicate Registration: To prevent data corruption and security information leaks, email
     *   addresses must have a unique constraint at the database layer. If a duplicate is detected,
     *   a clean exception (e.g., EmailAlreadyExistsException) is thrown and converted to HTTP 400.
     *
     * SYSTEM ARCHITECTURE & INTEGRATION:
     * After persisting the new user, the system publishes a UserRegisteredEvent to a messaging queue
     * (e.g., Apache Kafka). This allows downstream microservices to:
     * 1. Send a welcome email via an email/notification service.
     * 2. Initialize tenant workspaces, audit logs, or default settings asynchronously.
     * 3. Track user acquisition metrics in the marketing analytics pipeline.
     * Decoupling these processes via message queues improves API response times and overall system
     * resilience.
     *
     * HTTP RESPONSES:
     * - 201 Created: The user has been successfully registered and authenticated. Returns the access
     *   token, expiration details, token type, and refresh token in the response payload.
     * - 400 Bad Request: Input validation failed (e.g., weak password, invalid email format) or the
     *   provided email is already associated with another active account.
     *
     * @param registerRequest {@link RegisterRequest} containing the enrollment details.
     * @return {@link ResponseEntity} wrapping the token authorization response.
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Creates a new user profile in the database, generates JWT/refresh tokens, and publishes a UserRegisteredEvent to Kafka.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User successfully registered and authenticated", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid registration details or email already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // Log trace or info for debugging purposes in dev environments.
        // Delegates logic to the service layer to maintain a clean MVC separation.
        // Uses HttpStatus.CREATED (201) to comply with REST standards for resource creation.
        AuthResponse response = userService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * =============================================================================================
     * ENDPOINT: USER AUTHENTICATION & LOGIN (POST /api/auth/login)
     * =============================================================================================
     *
     * PURPOSE:
     * Validates user credentials (email and password) against stored credentials. Upon successful
     * verification, the system resets any active brute-force failure counters, creates a session
     * tracking entry, and issues an access/refresh token pair.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * Authenticating a user requires matching a submitted plaintext password with a hashed database
     * password. This is resource-intensive due to the computational cost of secure password hashes
     * like BCrypt (designed to defend against hardware-accelerated attacks).
     *
     * SECURITY CONSIDERATIONS:
     * - Brute-Force and Account Lockout: Production systems must track failed login attempts. Upon
     *   reaching a threshold (e.g., 5 consecutive failures), the user account must be locked for
     *   a cool-off period (e.g., 15 minutes) to mitigate automated dictionary and brute-force attacks.
     * - Role Verification: The login request includes the expected user role. If the user possesses
     *   a different role, authentication is denied to prevent privilege escalation attempts.
     * - Sensitive Headers: Response headers should include cache-control directives ("no-store",
     *   "no-cache", "must-revalidate") to prevent client browsers or intermediate proxy servers
     *   from caching the sensitive token payload.
     *
     * TOKEN STORAGE RECOMMENDATIONS:
     * Although this API returns tokens in the JSON response payload, clients are recommended to
     * store JWTs in secure places. For web clients, storing the refresh token in an HttpOnly, Secure,
     * and SameSite=Strict cookie protects against Cross-Site Scripting (XSS) attacks, while keeping
     * access tokens in short-lived application memory (in-memory state).
     *
     * HTTP RESPONSES:
     * - 200 OK: Authentication successful. Returns the active token credentials in the response body.
     * - 401 Unauthorized: Invalid credentials, incorrect role selection, or account is locked.
     *
     * @param loginRequest {@link LoginRequest} containing credentials and targeted access role.
     * @return {@link ResponseEntity} wrapping the generated authorization tokens.
     */
    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Validates user email, password, and role. Resets failed login attempts and returns active access/refresh tokens.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully logged in and authenticated", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "401", description = "Invalid credentials, wrong role, or temporarily locked account")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        // Delegates credentials validation to the service layer.
        // If login fails, an BadCredentialsException is thrown by Spring Security / service layer,
        // which gets caught by a global controller advice and converted to HTTP 401 Unauthorized.
        AuthResponse response = userService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * =============================================================================================
     * ENDPOINT: TOKEN ROTATION & REFRESH (POST /api/auth/refresh-token)
     * =============================================================================================
     *
     * PURPOSE:
     * Extends a user's session by issuing a new access token without requiring the user to re-enter
     * credentials. It implements Refresh Token Rotation (RTR) to enhance security.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * Refresh Token Rotation (RTR) is a security best practice for single-page applications and
     * mobile clients. Every time a refresh token is used, it is invalidated and replaced by a new
     * refresh token. This creates a chain of single-use tokens.
     *
     * SECURITY CONSIDERATIONS (BREACH DETECTION & REPLAY MITIGATION):
     * - Token Reuse Detection: If a client attempts to use a previously invalidated or rotated
     *   refresh token, the system flags this as a potential breach (session hijacking attempt).
     * - Cascading Revocation: If a refresh token reuse attack is detected, the authentication server
     *   must immediately revoke the entire token family associated with that session. This invalidates
     *   the currently active access tokens, forcing all clients using that session (including the
     *   attacker and the legitimate user) to re-authenticate, securing the account.
     * - Token Lifetimes: Access tokens should remain short-lived (e.g., 15 minutes) to limit the
     *   window of opportunity if intercepted. Refresh tokens have longer lifetimes (e.g., 7 days)
     *   but are protected by the rotation mechanism and database storage validation.
     *
     * SYSTEM ARCHITECTURE:
     * The controller calls the service layer, which validates the refresh token in the database,
     * verifies its expiration time, rotates the entry, and commits the transaction.
     *
     * HTTP RESPONSES:
     * - 200 OK: Rotation completed successfully. Returns a new access token and rotated refresh token.
     * - 400 Bad Request / 401 Unauthorized: Invalid, expired, or previously reused refresh token.
     *
     * @param request {@link RefreshTokenRequest} containing the active refresh token.
     * @return {@link ResponseEntity} containing the newly rotated credentials.
     */
    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access and rotation tokens", description = "Revokes the supplied refresh token, rotates security tokens, and returns a new access token pairing.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tokens rotated successfully", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Expired or invalid refresh token supplied")
    })
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        // Extracts the raw token from the request body payload.
        // Triggers the service logic to perform database lookup, revocation, and rotation.
        AuthResponse response = userService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * =============================================================================================
     * ENDPOINT: SESSION REVOCATION & LOGOUT (POST /api/auth/logout)
     * =============================================================================================
     *
     * PURPOSE:
     * Invalidates the active user session by revoking and deleting the provided refresh token from
     * the persistent store. This prevents any future access token refreshes using this token.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * While access tokens are stateless and cannot easily be revoked before expiration without
     * maintaining a complex blacklist, the refresh token represents the stateful link to the session.
     * Deleting or marking the refresh token as revoked in the database terminates the session.
     *
     * SECURITY CONSIDERATIONS:
     * - Token Blacklisting (Optional): To achieve instant logout of active access tokens, some
     *   systems push the access token signature to a high-speed cache (like Redis) with a Time-To-Live
     *   (TTL) matching the token's remaining lifespan. The security filter chain verifies access
     *   tokens against this blacklist during request processing.
     * - Client-Side Cleanup: Clients must discard the access token from application memory and clear
     *   the refresh token from local storage or cookie jars upon receiving a successful logout response.
     *
     * HTTP RESPONSES:
     * - 204 No Content: Logout successful, session invalidated. No response body is returned.
     * - 400 Bad Request: The provided refresh token was malformed, missing, or already revoked.
     *
     * @param request {@link RefreshTokenRequest} holding the refresh token to be revoked.
     * @return {@link ResponseEntity} with HTTP 204 status indicating successful completion.
     */
    @PostMapping("/logout")
    @Operation(summary = "Revoke session and log out", description = "Invalidates the active refresh token session, revoking access.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Successfully logged out and token invalidated"),
        @ApiResponse(responseCode = "400", description = "Token validation failed")
    })
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        // Calls the service layer to delete the refresh token from the database.
        // This effectively invalidates the user's session from a token perspective.
        userService.logout(request.getRefreshToken());
        // Standard REST pattern: Return 204 No Content for successful operations that do not yield
        // any response payload.
        return ResponseEntity.noContent().build();
    }

    /**
     * =============================================================================================
     * ENDPOINT: FORGOT PASSWORD WORKFLOW INITIATION (POST /api/auth/forgot-password)
     * =============================================================================================
     *
     * PURPOSE:
     * Triggers the user password recovery process. It verifies the existence of the email in the
     * system, generates a secure, short-lived One-Time Password (OTP), and sends it to the user.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * Password recovery must balance security and usability. Sending a direct password reset link
     * or OTP to the verified communication channel (email/SMS) is the standard method.
     *
     * SECURITY CONSIDERATIONS:
     * - User Enumeration Mitigation: In strict security environments, this endpoint should return
     *   a success response (e.g., HTTP 200 "If the email exists, an OTP has been sent") even if the
     *   email does not exist in the database. This prevents attackers from scanning the endpoint
     *   to discover valid user emails. However, here, if the application design throws an exception
     *   for missing emails, this choice should be documented as exposing account existence details
     *   in favor of immediate user feedback.
     * - Cryptographically Secure OTP: OTPs must be generated using secure random number generators
     *   (e.g., java.security.SecureRandom) rather than standard pseudo-random generators (e.g.,
     *   java.util.Random) to prevent sequence prediction.
     * - Expiration and Attempts: The OTP must be bound to a short expiration window (typically
     *   5 to 10 minutes) and limited to a small number of entry attempts (e.g., 3 attempts) to
     *   prevent brute-force validation.
     *
     * HTTP RESPONSES:
     * - 200 OK: OTP generated and sent to the email address.
     * - 400 Bad Request: No user profile matches the provided email address (if enumeration defense is disabled).
     *
     * @param request {@link ForgotPasswordRequest} specifying the user's email address.
     * @return {@link ResponseEntity} indicating that the recovery process has started.
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate forgot password workflow", description = "Validates the user email and emails a 6-digit verification OTP valid for 10 minutes.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OTP generated and emailed successfully"),
        @ApiResponse(responseCode = "400", description = "No user found with the registered email address")
    })
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Enters the forgot password pipeline by verifying the email.
        // Generates the OTP code, saves it with an expiration timestamp, and triggers sending the OTP.
        userService.forgotPassword(request);
        // Returns a success message wrapped in a Map. This structure easily parses to JSON on the client side.
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    /**
     * =============================================================================================
     * ENDPOINT: ONE-TIME PASSWORD VERIFICATION (POST /api/auth/verify-otp)
     * =============================================================================================
     *
     * PURPOSE:
     * Validates the OTP submitted by the user. If the OTP matches, has not expired, and has not
     * been used, a temporary verification flag is set to authorize the password reset step.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * Verification is an intermediate step. Once verified, the user is authorized to submit a
     * password reset request. The system must track this verification state securely.
     *
     * SECURITY CONSIDERATIONS:
     * - Replay Prevention: Once validated, the OTP must either be marked as used or immediately
     *   transitioned to an intermediate state. It cannot be used again.
     * - Validation Session Binding: The OTP verification must be bound to the specific user email
     *   initiating the request. An attacker must not be able to verify an OTP for one account
     *   and apply the password reset to a different account.
     * - Rate Limiting: Strict rate limits must apply to OTP verification endpoints. Attackers can
     *   easily guess a 6-digit numeric OTP (1 million possible combinations) within minutes without
     *   proper rate limits (e.g., maximum 3 failures per recovery session).
     *
     * HTTP RESPONSES:
     * - 200 OK: OTP is valid and verified. The user is authorized to proceed to password reset.
     * - 400 Bad Request: The OTP is incorrect, expired, or has already been used.
     *
     * @param request {@link VerifyOtpRequest} containing the email and the OTP code to verify.
     * @return {@link ResponseEntity} confirming successful OTP validation.
     */
    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP code", description = "Validates the 6-digit OTP code against the user's active recovery session.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OTP code verified successfully"),
        @ApiResponse(responseCode = "400", description = "Incorrect, expired, or already utilized OTP code")
    })
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        // Evaluates the user email and OTP pair.
        // Throws an exception if verification fails, returning a 400 Bad Request to the caller.
        userService.verifyOtp(request);
        // Informs the client application that the verification state is now validated.
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    /**
     * =============================================================================================
     * ENDPOINT: PASSWORD RESET EXECUTION (POST /api/auth/reset-password)
     * =============================================================================================
     *
     * PURPOSE:
     * Completes the recovery workflow by updating the user's password. It requires that the OTP
     * has been validated and that the request contains the new password matching validation criteria.
     *
     * INDUSTRIAL IMPLEMENTATION DETAIL:
     * This endpoint updates user credentials. In addition to updating the password, the service layer
     * must invalidate all active sessions, access tokens, and refresh tokens for the user. This
     * prevents unauthorized access if the account was compromised.
     *
     * SECURITY CONSIDERATIONS:
     * - Verification Verification: The controller or service must verify that a valid OTP verification
     *   event occurred before resetting the password. The client must not be able to bypass the OTP
     *   verification endpoint and invoke reset-password directly.
     * - Password Strength: The new password must be validated against password policy rules (e.g.,
     *   minimum length, character diversity) to prevent users from setting weak passwords.
     * - BCrypt Encoding: The new password must be encrypted using a secure hashing algorithm (e.g.,
     *   BCrypt) before database storage.
     * - Session Invalidation: Resetting the password must immediately revoke all existing refresh
     *   tokens and active sessions, forcing all logged-in devices to re-authenticate.
     *
     * HTTP RESPONSES:
     * - 200 OK: Password successfully reset. The user can now log in using the new credentials.
     * - 400 Bad Request: Verification state missing, OTP expired, or password strength criteria not met.
     *
     * @param request {@link ResetPasswordRequest} containing the new password and verification data.
     * @return {@link ResponseEntity} confirming successful password update.
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Reset account password", description = "Replaces the password using a verified OTP. The OTP is marked as used.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password reset completed successfully"),
        @ApiResponse(responseCode = "400", description = "OTP has not been verified or expired")
    })
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // Passes the request payload containing credentials and session information.
        // Performs the password update and clears the OTP session to ensure a single-use flow.
        userService.resetPassword(request);
        // Responds with a success message confirming the operation's completion.
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
