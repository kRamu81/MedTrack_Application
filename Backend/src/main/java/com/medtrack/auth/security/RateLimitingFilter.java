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

    @Value("${security.rate-limit.auth.capacity:10}")
    private int authCapacity;

    @Value("${security.rate-limit.auth.refill-tokens:10}")
    private int authRefillTokens;

    @Value("${security.rate-limit.auth.refill-duration:1m}")
    private String authRefillDurationStr;

    @Value("${security.rate-limit.get.capacity:100}")
    private int getCapacity;

    @Value("${security.rate-limit.get.refill-tokens:100}")
    private int getRefillTokens;

    @Value("${security.rate-limit.get.refill-duration:1m}")
    private String getRefillDurationStr;

    @Value("${security.rate-limit.write.capacity:30}")
    private int writeCapacity;

    @Value("${security.rate-limit.write.refill-tokens:30}")
    private int writeRefillTokens;

    @Value("${security.rate-limit.write.refill-duration:1m}")
    private String writeRefillDurationStr;

    private final ConcurrentHashMap<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Bandwidth authBandwidth;
    private Bandwidth getBandwidth;
    private Bandwidth writeBandwidth;

    @PostConstruct
    public void init() {
        this.authBandwidth = Bandwidth.classic(authCapacity, Refill.intervally(authRefillTokens, parseDuration(authRefillDurationStr)));
        this.getBandwidth = Bandwidth.classic(getCapacity, Refill.intervally(getRefillTokens, parseDuration(getRefillDurationStr)));
        this.writeBandwidth = Bandwidth.classic(writeCapacity, Refill.intervally(writeRefillTokens, parseDuration(writeRefillDurationStr)));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI().substring(request.getContextPath().length());
        String method = request.getMethod();

        if (path.startsWith("/api/")) {
            String group = resolveGroup(path, method);
            String ip = getClientIp(request);
            String key = group + ":" + ip;

            Bucket bucket = cache.computeIfAbsent(key, k -> Bucket.builder().addLimit(resolveBandwidth(group)).build());

            if (!bucket.tryConsume(1)) {
                sendTooManyRequestsResponse(request, response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveGroup(String path, String method) {
        if ("POST".equalsIgnoreCase(method) && (
            "/api/auth/login".equals(path) ||
            "/api/auth/register".equals(path) ||
            "/api/auth/forgot-password".equals(path) ||
            "/api/auth/verify-otp".equals(path) ||
            "/api/auth/reset-password".equals(path) ||
            "/api/auth/refresh-token".equals(path)
        )) {
            return "auth";
        }
        if ("GET".equalsIgnoreCase(method)) {
            return "get";
        }
        return "write";
    }

    private Bandwidth resolveBandwidth(String group) {
        switch (group) {
            case "auth": return authBandwidth;
            case "get":  return getBandwidth;
            default:     return writeBandwidth;
        }
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
