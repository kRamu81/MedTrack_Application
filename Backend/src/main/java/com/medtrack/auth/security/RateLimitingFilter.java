package com.medtrack.auth.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${security.rate-limit.capacity:10}")
    private int capacity;

    @Value("${security.rate-limit.refill-tokens:10}")
    private int refillTokens;

    @Value("${security.rate-limit.refill-duration:1m}")
    private String refillDurationStr;

    private final ConcurrentHashMap<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private Duration refillDuration;

    @PostConstruct
    public void init() {
        this.refillDuration = parseDuration(refillDurationStr);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI().substring(request.getContextPath().length());
        String method = request.getMethod();

        boolean isAuthEndpoint = "POST".equalsIgnoreCase(method) && (
            "/api/auth/login".equals(path) ||
            "/api/auth/register".equals(path) ||
            "/api/auth/forgot-password".equals(path) ||
            "/api/auth/verify-otp".equals(path) ||
            "/api/auth/reset-password".equals(path) ||
            "/api/auth/refresh-token".equals(path)
        );

        if (isAuthEndpoint) {
            String ip = getClientIp(request);
            Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());

            if (!bucket.tryConsume(1)) {
                sendTooManyRequestsResponse(request, response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private Bucket createNewBucket() {
        Refill refill = Refill.intervally(refillTokens, refillDuration);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private Duration parseDuration(String value) {
        if (value == null || value.trim().isEmpty()) {
            return Duration.ofMinutes(1);
        }
        value = value.trim().toLowerCase();
        if (value.endsWith("s")) {
            return Duration.ofSeconds(Long.parseLong(value.substring(0, value.length() - 1)));
        } else if (value.endsWith("m")) {
            return Duration.ofMinutes(Long.parseLong(value.substring(0, value.length() - 1)));
        } else if (value.endsWith("h")) {
            return Duration.ofHours(Long.parseLong(value.substring(0, value.length() - 1)));
        } else if (value.endsWith("d")) {
            return Duration.ofDays(Long.parseLong(value.substring(0, value.length() - 1)));
        } else {
            return Duration.ofSeconds(Long.parseLong(value));
        }
    }

    private void sendTooManyRequestsResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorDetails = new LinkedHashMap<>();
        errorDetails.put("timestamp", Instant.now().toString());
        errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorDetails.put("error", HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase());
        errorDetails.put("message", "Too many requests. Please try again later.");
        errorDetails.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getWriter(), errorDetails);
        response.getWriter().flush();
    }
}
