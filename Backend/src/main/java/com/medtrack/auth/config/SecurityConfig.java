package com.medtrack.auth.config;

import com.medtrack.auth.security.JwtAuthFilter;
import com.medtrack.auth.security.RateLimitingFilter;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.model.AccountStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import com.medtrack.auth.security.CustomAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Central security architecture definitions and rules for the MedTrack platform.
 * Governs identity validation, access controls, CORS mappings, and session state.
 *
 * Implements stateless token-based protection to secure all REST API endpoints.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final RateLimitingFilter rateLimitingFilter;

    /**
     * Instantiates the BCrypt password encoder for secure credential hashing.
     * Incorporates salt generation automatically to prevent rainbow table matches.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Resolves user accounts from the database by email address.
     * Maps account state (disabled, locked) and roles directly to Spring Security standards.
     */
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            com.medtrack.auth.model.User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_" + user.getRole().toUpperCase())
                    .disabled(user.getAccountStatus() == AccountStatus.DISABLED)
                    .accountLocked(user.getAccountStatus() == AccountStatus.LOCKED)
                    .build();
        };
    }

    /**
     * Configures the DAO-based authentication provider to link the user database
     * lookup mechanism with the chosen BCrypt encoder for verification checks.
     */
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager bean, facilitating programmatic authentication
     * from authentication controllers (e.g. login actions).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Main security filter chain that intercepts, filters, and authorizes all incoming HTTP requests.
     * Restricts endpoints by role-based authorities and injects custom token validation filters.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disables CSRF as requests do not rely on browser cookie sessions.
            .csrf(AbstractHttpConfigurer::disable)
            
            // Custom CORS configuration integration.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Strictly stateless session manager policy (no server sessions stored).
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Route-level authorization controls.
            .authorizeHttpRequests(auth -> auth
                // Permitted public paths (auth flows, H2 console, Swagger, Actuator endpoints).
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/refresh-token",
                    "/api/auth/logout",
                    "/api/auth/forgot-password",
                    "/api/auth/verify-otp",
                    "/api/auth/reset-password",
                    "/h2-console/**",
                    "/error",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info").permitAll()

                // Equipment module boundaries:
                // GET requests: Authorized users.
                // Write/Modify: Restricted to Hospital admins.
                .requestMatchers(HttpMethod.GET, "/api/equipment/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasRole("HOSPITAL")

                // Procurement Orders module boundaries:
                // GET requests: Authorized users.
                // Write/Modify: Restricted to Hospital admins.
                // Status changes: Restricted to Suppliers.
                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders/*/invoice/email").hasRole("SUPPLIER")
                .requestMatchers(HttpMethod.POST, "/api/orders/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("SUPPLIER")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("HOSPITAL")

                // Maintenance schedules boundaries:
                // GET requests: Authorized users.
                // Write/Modify: Restricted to Hospital admins.
                // Updates/Completions: Restricted to Technicians.
                .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/maintenance/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasRole("TECHNICIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasRole("HOSPITAL")

                // Shipment tracking boundaries:
                // GET requests: Any authenticated user.
                // Write/Modify: Restricted to Suppliers.
                .requestMatchers(HttpMethod.GET, "/api/shipments/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/shipments").hasRole("SUPPLIER")
                .requestMatchers(HttpMethod.PUT, "/api/shipments/**").hasRole("SUPPLIER")

                // All other endpoints require authentication.
                .anyRequest().authenticated()
            )
            
            // RateLimitingFilter runs first at the edge to mitigate DOS and brute force attempts.
            .addFilterBefore(rateLimitingFilter, LogoutFilter.class)
            // JwtAuthFilter extracts and verifies incoming bearer tokens.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Translates authentication issues into structured JSON error models.
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(customAuthenticationEntryPoint)
            )

            // Bypasses frame protections solely to accommodate local database console iframe operations.
            .headers(headers -> headers.frameOptions(options -> options.disable()));

        return http.build();
    }

    /**
     * CORS configurations matching local web applications.
     * Caches CORS checks locally to optimize request dispatch speed.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
