package com.medtrack.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

public class RateLimitingFilterTest {

    private RateLimitingFilter rateLimitingFilter;
    private FilterChain filterChain;

    @BeforeEach
    public void setup() {
        rateLimitingFilter = new RateLimitingFilter();
        filterChain = Mockito.mock(FilterChain.class);

        // Inject configuration values
        ReflectionTestUtils.setField(rateLimitingFilter, "capacity", 2);
        ReflectionTestUtils.setField(rateLimitingFilter, "refillTokens", 2);
        ReflectionTestUtils.setField(rateLimitingFilter, "refillDurationStr", "1m");

        rateLimitingFilter.init();
    }

    @Test
    public void testRequestUnderLimit_Succeeds() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilter(request, response, filterChain);

        assertEquals(HttpStatus.OK.value(), response.getStatus() == 0 ? HttpStatus.OK.value() : response.getStatus());
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    public void testRequestExceedingLimit_Returns429() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.1.1");

        // 1st request - allowed
        MockHttpServletResponse response1 = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(request, response1, filterChain);
        verify(filterChain, times(1)).doFilter(request, response1);

        // 2nd request - allowed (capacity = 2)
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(request, response2, filterChain);
        verify(filterChain, times(1)).doFilter(request, response2);

        // 3rd request - blocked (HTTP 429)
        MockHttpServletResponse response3 = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(request, response3, filterChain);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), response3.getStatus());
        assertTrue(response3.getContentAsString().contains("Too Many Requests"));
        assertTrue(response3.getContentAsString().contains("/api/auth/login"));
    }

    @Test
    public void testNonAuthEndpoint_NotRateLimited() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/equipment");
        request.setRemoteAddr("10.0.0.1");

        // Trigger 5 requests on a limit of 2
        for (int i = 0; i < 5; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(request, response, filterChain);
            verify(filterChain, times(1)).doFilter(request, response);
        }
    }
}
