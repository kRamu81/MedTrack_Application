package com.medtrack.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthFilter is a custom security filter that intercepts every incoming HTTP request
 * exactly once (extending {@link OncePerRequestFilter}) to inspect the request for a valid JSON Web Token (JWT).
 * 
 * <p>If a valid token is found in the {@code Authorization} request header, the filter parses
 * the token, extracts the user's email and role, builds an authentication token, and registers
 * it within Spring Security's {@link SecurityContextHolder}. This establishes the user's identity
 * and granted authorities for the duration of the request.</p>
 *
 * <p>Annotations used:
 * <ul>
 *   <li>{@code @Component}: Declares this class as a Spring-managed component so it can be auto-detected and injected.</li>
 *   <li>{@code @RequiredArgsConstructor}: Generates a constructor to inject the required {@link JwtUtil} bean.</li>
 * </ul>
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    /**
     * Helper utility class responsible for JWT verification, parsing, and claims extraction.
     */
    private final JwtUtil jwtUtil;

    /**
     * Intercepts incoming requests to extract the JWT token from the authorization header,
     * validate it, and authenticate the client if the token is valid.
     *
     * @param request the incoming {@link HttpServletRequest} containing request headers and body
     * @param response the {@link HttpServletResponse} to write response details
     * @param filterChain the {@link FilterChain} representing the list of filters to pass the request/response through
     * @throws ServletException if a servlet-specific error occurs during filtering
     * @throws IOException if an I/O error occurs during request/response processing
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Retrieve the 'Authorization' header from request
        final String authHeader = request.getHeader("Authorization");

        // Skip token validation if the Authorization header is missing or does not start with the 'Bearer ' scheme.
        // SecurityConfig will intercept the request later in the filter chain to block access if the path is protected.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract raw token string (strip "Bearer " prefix)
        final String token = authHeader.substring(7);

        try {
            // Extract core claims (subject/email and role) from the token
            final String email = jwtUtil.extractEmail(token);
            final String role = jwtUtil.extractRole(token);

            // Execute authentication lookup if email is found and context is not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Verify token signature and check expiration date
                if (jwtUtil.isTokenValid(token, email)) {
                    // Map the user's role to a Spring Security authority with a "ROLE_" prefix.
                    // This matches the role mappings expected by Spring Security's hasRole() rules.
                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                    // Create an authentication token containing user credentials and authorities
                    var authToken = new UsernamePasswordAuthenticationToken(
                            email, null, authorities
                    );
                    
                    // Set the populated authentication token in the security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Clear the security context in case of parsing errors, expiration, or token tampering
            SecurityContextHolder.clearContext();
        }

        // Hand off control to the next filter in the servlet filter chain
        filterChain.doFilter(request, response);
    }
}
