package com.medtrack.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * JwtUtil is a helper utility component responsible for handling JSON Web Tokens (JWT).
 * It provides methods to construct/generate tokens, parse and extract payload claims 
 * (such as user email, roles, and expiration date), and validate token integrity and lifetime.
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Component}: Marks this class as a Spring-managed utility component for easy autowiring dependency injection.</li>
 * </ul>
 * </p>
 */
@Component
public class JwtUtil {

    // Strong cryptographic signing key (must be at least 256 bits).
    // WARNING: In production environments, this key must be loaded from external configuration (e.g., system env vars)
    // rather than being hardcoded inside the class codebase to prevent source code exposure vulnerabilities.
    private static final String SECRET = "medtrack-super-secret-key-change-this-in-production-1234567890";
    private static final SecretKey SIGNING_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Token validity period set to 24 hours (in milliseconds)
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24;

    /**
     * Generates a new JSON Web Token (JWT) signed with HMAC-SHA containing the user's email and role.
     *
     * @param email user email address to be set as the subject claim
     * @param role user role (e.g., "hospital", "technician", "supplier") to be set as a custom claim
     * @return the compacted, cryptographically signed JWT string
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SIGNING_KEY)
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
                .verifyWith(SIGNING_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
