package com.medtrack.auth.security;

import com.medtrack.auth.authority.service.AuthorityService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies that {@link JwtAuthFilter} enforces authority-version revocation: a JWT whose
 * embedded authority version no longer matches the user's current database version must be
 * rejected even though the token has not yet expired. This closes the gap where incrementing
 * a user's authority version (role demotion, forced logout, global security bump) previously
 * had no real effect until the token's natural expiry.
 */
@ExtendWith(MockitoExtension.class)
public class JwtAuthFilterTest {

    @Mock
    private AuthorityService authorityService;

    private JwtUtil jwtUtil;
    private JwtAuthFilter jwtAuthFilter;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "secret",
                "medtrack-super-secret-key-change-this-in-production-1234567890");
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtil, "expirationMs", 900000L);

        jwtAuthFilter = new JwtAuthFilter(jwtUtil, authorityService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_AuthenticatesWhenAuthorityVersionCurrent() throws Exception {
        String token = jwtUtil.generateToken(10L, "hospital@medtrack.org", "hospital", 3L);
        when(authorityService.validateAuthorityVersion(10L, 3L)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_RejectsWhenAuthorityVersionRevoked() throws Exception {
        // Token was issued while the user's authority version was 1, but an admin has since
        // incremented it (e.g. demoted the role or forced a global logout).
        String token = jwtUtil.generateToken(10L, "hospital@medtrack.org", "hospital", 1L);
        when(authorityService.validateAuthorityVersion(10L, 1L)).thenReturn(false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}
