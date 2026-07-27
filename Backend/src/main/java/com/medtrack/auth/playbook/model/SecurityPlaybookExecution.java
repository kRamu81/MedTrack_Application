package com.medtrack.auth.playbook.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking security playbook execution runs.
 */
@Entity
@Table(name = "security_playbook_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPlaybookExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String executionId; // e.g., PLBK-EXEC-9910

    @Column(nullable = false)
    private String playbookName;

    @Column(nullable = false)
    private String triggerEvent; // BRUTE_FORCE, UNAUTHORIZED_ROLE_ESCALATION

    @Column(nullable = false)
    private String executedAction; // REVOKE_TOKENS_AND_BAN_IP

    @Column(nullable = false)
    private String executionStatus; // SUCCESS, FAILED, IN_PROGRESS

    @Column(nullable = false)
    private String affectedAsset; // e.g., user:sarah.connor or ip:192.168.1.105

    @Column(nullable = false)
    private String executedBy; // PLAYBOOK_ENGINE, SOC_OPERATOR

    @Column(length = 1500)
    private String executionSummary;

    @Column(nullable = false)
    private LocalDateTime executedAt;
}
