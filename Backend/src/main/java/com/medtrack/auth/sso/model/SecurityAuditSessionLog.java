package com.medtrack.auth.sso.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * JPA entity logging comprehensive security events, authentication risk scores,
 * IP origins, and anomaly flags for user logins and session access.
 */
@Entity
@Table(name = "security_audit_session_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditSessionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userEmail;

    @Column(nullable = false)
    private String eventType; // LOGIN_SUCCESS, LOGIN_FAILED, SSO_REDIRECT, RISK_ALERT, SESSION_EXPIRED

    private String authenticationMethod; // PASSWORD, OAUTH2_GOOGLE, OAUTH2_AZURE, SAML, TOTP_2FA

    private String ipAddress;
    private String location;
    private String userAgent;

    private int riskScore; // 0 to 100 calculated threat score

    private boolean suspiciousActivity;

    private String notes;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
