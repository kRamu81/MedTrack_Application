package com.medtrack.auth.playbook.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing automated SOAR Security Playbook policies & containment rules.
 */
@Entity
@Table(name = "security_playbook_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPlaybookPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String playbookName; // e.g., MASTER_CONTAINMENT_PLAYBOOK

    @Column(nullable = false)
    private String triggerEvent; // BRUTE_FORCE, UNAUTHORIZED_ROLE_ESCALATION, RANSOMWARE_BEHAVIOR

    @Column(nullable = false)
    private String defaultContainmentAction; // REVOKE_TOKENS_AND_BAN_IP, ISOLATE_HOST, SUSPEND_USER

    @Column(nullable = false)
    private String executionMode; // AUTOMATIC, SEMI_AUTOMATIC, MANUAL_APPROVAL

    @Column(nullable = false)
    private int cooldownMinutes;

    @Column(nullable = false)
    private boolean notifySocOnExecution;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
