package com.medtrack.auth.threat.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity auditing automated/manual SOAR incident containment actions.
 */
@Entity
@Table(name = "threat_containment_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreatContainmentAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String incidentId;

    @Column(nullable = false)
    private String actionType; // IP_BAN, ACCOUNT_LOCKOUT, REVOKE_SESSION, ISOLATE_USER

    @Column(nullable = false)
    private String executedBy; // AUTOMATED_SOAR_ENGINE, SOC_ADMIN

    @Column(nullable = false)
    private String status; // EXECUTED, REVERSED, FAILED

    @Column(length = 1000)
    private String actionNotes;

    @Column(nullable = false)
    private LocalDateTime executedAt;
}
