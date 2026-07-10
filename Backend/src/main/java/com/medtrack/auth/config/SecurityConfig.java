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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import com.medtrack.auth.security.CustomAuthenticationEntryPoint;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig is the central configuration class for Spring Security in the
 * MedTrack application.
 * It defines the security filters, authorization rules, CORS policies, and
 * password hashing mechanisms
 * used to secure the backend REST APIs.
 * 
 * <p>
 * Key Responsibilities of this configuration:
 * <ul>
 * <li><strong>Stateless Authentication:</strong> Disables standard session
 * creation and relies entirely on stateless JWT tokens.</li>
 * <li><strong>JWT Authentication Filter:</strong> Configures and inserts the
 * custom {@link JwtAuthFilter} into the Spring Security filter chain to
 * intercept and validate incoming authorization headers.</li>
 * <li><strong>Role-Based Access Control (RBAC):</strong> Sets fine-grained
 * access rules based on HTTP methods and roles (e.g., HOSPITAL, TECHNICIAN,
 * SUPPLIER).</li>
 * <li><strong>Cross-Origin Resource Sharing (CORS):</strong> Customizes CORS
 * settings to allow communication with the React frontend application running
 * on local port 3000.</li>
 * <li><strong>Cross-Site Request Forgery (CSRF) protection:</strong> Disables
 * CSRF protection since APIs are stateless and do not rely on session
 * cookies.</li>
 * <li><strong>H2 Console Support:</strong> Configures frame options to allow
 * access to the embedded H2 database console for development purposes.</li>
 * </ul>
 * </p>
 *
 * <p>
 * Annotations used:
 * <ul>
 * <li>{@code @Configuration}: Indicates that the class can be used by the
 * Spring IoC container as a source of bean definitions.</li>
 * <li>{@code @EnableWebSecurity}: Enables Spring Security's web security
 * support and provides the Spring MVC integration.</li>
 * <li>{@code @RequiredArgsConstructor}: Lombok annotation that generates a
 * constructor for all {@code final} fields (injecting the
 * {@link JwtAuthFilter}).</li>
 * </ul>
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Custom JWT authentication filter responsible for extracting, parsing, and
     * validating JWT tokens
     * from the "Authorization" header of incoming HTTP requests. If valid, the
     * filter sets the
     * authentication context in Spring's SecurityContextHolder.
     */
    private final JwtAuthFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final RateLimitingFilter rateLimitingFilter;

    /**
     * Configures and registers a {@link PasswordEncoder} bean.
     * Uses the BCrypt strong password hashing function. BCrypt internally
     * incorporates a salt
     * to protect against rainbow table attacks and has an adjustable work factor
     * (strength)
     * to resist brute-force search attacks.
     *
     * @return a {@link PasswordEncoder} instance using the BCrypt hashing algorithm
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures the main {@link SecurityFilterChain} which intercept and handle
     * all incoming web requests.
     * This method defines security rules, public endpoints, role-based restriction
     * on resources,
     * CORS mapping, stateless session policy, and integrates custom filters.
     *
     * @param http the {@link HttpSecurity} object to configure security settings
     * @return the configured {@link SecurityFilterChain} bean
     * @throws Exception if an error occurs while configuring the security filter
     *                   chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (Cross-Site Request Forgery)
            // CSRF protection is generally required for cookie-based sessions. Since this application
            // uses stateless JWTs passed via the Authorization header, the client is not susceptible
            // to standard CSRF attacks, allowing us to safely disable this protection.
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Enable CORS (Cross-Origin Resource Sharing)
            // Integrates the CORS configuration source bean (corsConfigurationSource) to define
            // which client applications (origins) can make requests to our API.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. Set Session Management to STATELESS
            // Ensures that Spring Security does not create or maintain any HTTP sessions (HttpSession).
            // Every request must be independently authenticated via the JWT token.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Configure URL Authorization Rules
            // Defines access rules based on API paths, HTTP methods, and user roles.
            .authorizeHttpRequests(auth -> auth
                // Allow public access (no authentication required) to:
                // - Authentication endpoints: login and registration
                // - H2 database console: utilized during development for database visualization
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

                // Rule set for Equipment management:
                // - Read (GET): Any authenticated user can view equipment details.
                // - Write/Modify (POST, PUT, DELETE): Restricted to users with the 'HOSPITAL' role.
                .requestMatchers(HttpMethod.GET, "/api/equipment/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasRole("HOSPITAL")

                // Rule set for Orders management:
                // - Read (GET): Any authenticated user can view order details.
                // - Creation/Removal (POST, DELETE): Restricted to users with the 'HOSPITAL' role.
                // - Status Updates (PUT to /status endpoint): Restricted to suppliers ('SUPPLIER' role).
                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/orders/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("SUPPLIER")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("HOSPITAL")

                // Rule set for Maintenance schedules/tasks:
                // - Read (GET): Any authenticated user can view maintenance tasks.
                // - Creation/Removal (POST, DELETE): Restricted to users with the 'HOSPITAL' role.
                // - Editing/Completion (PUT): Restricted to technicians ('TECHNICIAN' role).
                .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/maintenance/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/api/maintenance/**").hasRole("TECHNICIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/maintenance/**").hasRole("HOSPITAL")

                // Fallback rule: Any request not matching the rules above must be fully authenticated.
                .anyRequest().authenticated()
            )
            
            .addFilterBefore(rateLimitingFilter, LogoutFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            // 5b. Exception Handling for Unauthorized Requests
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(customAuthenticationEntryPoint)
            )

            // 6. Disable X-Frame-Options headers
            // Disables frame options specifically to allow H2 Console to render inside an <iframe>.
            // Spring Security by default blocks frame rendering (DENY) to prevent clickjacking attacks.
            .headers(headers -> headers.frameOptions(options -> options.disable()));

        return http.build();
    }

    /**
     * Configures the Cross-Origin Resource Sharing (CORS) source bean.
     * Defines the rules governing how external web applications interact with this
     * API.
     *
     * <p>
     * Configured parameters:
     * <ul>
     * <li><strong>Allowed Origins:</strong> Explicitly allows requests from the
     * React frontend running on "http://localhost:3000".</li>
     * <li><strong>Allowed Methods:</strong> Restricts operations to safe methods:
     * GET, POST, PUT, DELETE, OPTIONS, PATCH.</li>
     * <li><strong>Allowed Headers:</strong> Permits essential headers including
     * Authorization (JWT credentials) and Content-Type (JSON payloads).</li>
     * <li><strong>Allow Credentials:</strong> Allows cookies, authorization
     * headers, or SSL client certificates to be exposed on cross-origin
     * requests.</li>
     * <li><strong>Max Age (3600 seconds):</strong> Caches the preflight OPTIONS
     * request handshake on the client/browser for 1 hour to reduce network
     * overhead.</li>
     * </ul>
     * </p>
     *
     * @return a {@link CorsConfigurationSource} used to validate cross-origin
     *         requests
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Restrict allowed origin to React Frontend application
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        // Define HTTP methods allowed during cross-origin requests
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Define allowed request headers to allow custom authorization headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        // Allow client browser to send authentication credentials (JWT/cookies)
        configuration.setAllowCredentials(true);
        // Cache preflight CORS checks on the client for 1 hour to optimize performance
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all API endpoints in the application
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
