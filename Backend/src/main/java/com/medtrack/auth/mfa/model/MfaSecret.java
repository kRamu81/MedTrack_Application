package com.medtrack.auth.mfa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Enterprise JPA entity storing Multi-Factor Authentication (MFA / 2FA) secret keys,
 * verification status, and emergency recovery backup codes per user account.
 */
@Entity
@Table(name = "user_mfa_secrets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaSecret {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String secretKey;

    @Column(nullable = false)
    private boolean enabled;

    @Column(length = 2000)
    private String recoveryCodes; // Comma-separated hashed backup recovery codes

    private LocalDateTime enabledAt;

    private int failedAttempts;

    @org.hibernate.annotations.UpdateTimestamp
    private LocalDateTime lastVerifiedAt;
}
