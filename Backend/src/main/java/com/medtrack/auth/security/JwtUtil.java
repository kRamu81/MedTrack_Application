package com.medtrack.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * JwtUtil is a helper utility component responsible for handling JSON Web Tokens (JWT).
 * It provides methods to construct/generate tokens, parse and extract payload claims 
 * (such as user email, roles, and expiration date), and validate token integrity and lifetime.
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret:medtrack-super-secret-key-change-this-in-production-1234567890}")
    private String secret;

    @Value("${app.jwt.expiration-ms:900000}") // Default to 15 minutes in ms
    private long expirationMs;

    /**
     * Internal helper to build the HMAC signing key from the configured secret.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generates a new JSON Web Token (JWT) signed with HMAC-SHA containing the user's ID, email and role.
     *
     * @param userId user database ID to be set as a custom claim
     * @param email user email address to be set as the subject claim
     * @param role user role (e.g., "hospital", "technician", "supplier") to be set as a custom claim
     * @return the compacted, cryptographically signed JWT string
     */
    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Helper to extract the subject (representing user email) from the JWT claims payload.
     *
     * @param token the JWT string to parse
     * @return the extracted email address
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Helper to extract the custom 'role' claim from the JWT claims payload.
     *
     * @param token the JWT string to parse
     * @return the custom role string stored in the claims
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Helper to extract the expiration timestamp of the token.
     *
     * @param token the JWT string to parse
     * @return the {@link Date} object representing token expiration time
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Validates the integrity of the JWT token by checking if it matches the expected user email
     * and ensuring it has not exceeded its expiration date.
     *
     * @param token the JWT string to validate
     * @param email the expected email address of the authenticated user
     * @return {@code true} if the token is valid and unexpired, {@code false} otherwise
     */
    public boolean isTokenValid(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return extractedEmail.equals(email) && !isTokenExpired(token);
    }

    /**
     * Internal helper to verify if the token's expiration date has passed the current system time.
     *
     * @param token the JWT string to check
     * @return {@code true} if the token has expired, {@code false} otherwise
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generic helper method to parse the token and extract a specific claim using a resolver function.
     *
     * @param <T> the type of the claim property being resolved
     * @param token the JWT string to extract from
     * @param claimsResolver a functional interface mapping the parsed {@link Claims} payload to target type {@code T}
     * @return the resolved claim value
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses and cryptographically verifies the token using the HMAC signing key,
     * returning the full claims body payload.
     *
     * @param token the JWT string to verify and parse
     * @return the validated {@link Claims} payload
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
