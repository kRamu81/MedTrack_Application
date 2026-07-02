package com.medtrack.security;

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
 * Filter that intercepts incoming HTTP requests once per execution to validate JSON Web Tokens (JWT).
 * If a valid token is present in the Authorization header, it extracts the user details and role
 * and registers them in Spring Security's SecurityContext.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Skip validation if the Authorization header is missing or improperly formatted.
        // SecurityConfig will determine if the requested path requires authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7); // Remove "Bearer " prefix

        try {
            final String email = jwtUtil.extractEmail(token);
            final String role = jwtUtil.extractRole(token);

            // Proceed with authentication if the user email is retrieved and context isn't already authenticated.
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.isTokenValid(token, email)) {
                    // Map the user's role to a Spring Security authority with a "ROLE_" prefix.
                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                    var authToken = new UsernamePasswordAuthenticationToken(
                            email, null, authorities
                    );
                    
                    // Set the authentication details in the security context.
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Clear context if token parsing or validation fails (e.g., token expired or tampered).
            SecurityContextHolder.clearContext();
        }

        // Pass the request along the remaining filter chain.
        filterChain.doFilter(request, response);
    }
}
