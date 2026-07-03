package com.medtrack.config;

import com.medtrack.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Main Spring Security configuration class.
 * Secures application endpoints, registers the JWT authentication filter,
 * sets session policy to stateless, and configures CORS/CSRF options.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Password encoder bean using BCrypt hashing algorithm for securing passwords.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configures HTTP security rules, endpoint authorization, stateless sessions,
     * and registers the custom JWT filter.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF as authentication is state-less and uses JWT tokens
            .csrf(AbstractHttpConfigurer::disable)
            // Enable CORS mapping defined by corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Set session management to stateless (no HTTP sessions will be created/used)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Define access control rules for endpoints
            .authorizeHttpRequests(auth -> auth
                // Public endpoints accessible without authentication
                .requestMatchers(
                    "/api/user/login",
                    "/api/user/register",
                    "/h2-console/**"
                ).permitAll()

                // Equipment: Viewable by authenticated users; managed only by Hospital accounts
                .requestMatchers(HttpMethod.GET, "/api/equipment/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasRole("HOSPITAL")

                // Orders: Viewable by authenticated users; created/deleted by Hospital; status updated by Supplier
                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("SUPPLIER")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("HOSPITAL")

                // Maintenance: Viewable by authenticated users; created/deleted by Hospital; completed/updated by Technician
                .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/maintenance/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasRole("TECHNICIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasRole("HOSPITAL")

                // All other requests require authentication
                .anyRequest().authenticated()
            )
            // Inject JWT filter before the standard username-password authentication filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            // Disable frame options to allow the H2 console interface to load in frames
            .headers(headers -> headers.frameOptions(options -> options.disable()));

        return http.build();
    }

    /**
     * Defines CORS configuration allowing cross-origin requests from the React frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // React Frontend url
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache CORS pre-flight responses for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
