package com.medtrack.auth.zerotrust.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking zero-trust security policy violations and anomaly events.
 */
@Entity
@Table(name = "security_policy_violation_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPolicyViolationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String violationType; // RATE_LIMIT_EXCEEDED, IP_BLOCKED, ANOMALOUS_LOCATION, UNAUTHORIZED_ROLE

    @Column(nullable = false)
    private String severity; // INFO, WARNING, SEVERE, CRITICAL

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean resolved;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
