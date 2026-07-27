package com.medtrack.auth.playbook.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity tracking step-by-step action details for automated security playbooks.
 */
@Entity
@Table(name = "playbook_step_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaybookStepResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String stepId; // e.g., STEP-01

    @Column(nullable = false)
    private String stepName; // REVOKE_JWT_TOKENS, IP_FIREWALL_BLOCK, NOTIFY_SOC_LEAD

    @Column(nullable = false)
    private String stepStatus; // COMPLETED, FAILED, SKIPPED

    @Column(length = 1500)
    private String stepDetails;

    private String executionId;

    @Column(nullable = false)
    private LocalDateTime executedAt;
}
