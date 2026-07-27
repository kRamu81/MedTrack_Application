package com.medtrack.auth.evidence.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing cryptographic audit chain blocks verifying evidence immutability.
 */
@Entity
@Table(name = "evidence_audit_chain_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceAuditChainLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private long blockIndex;

    @Column(nullable = false, length = 128)
    private String currentHash;

    @Column(nullable = false, length = 128)
    private String previousHash;

    @Column(nullable = false)
    private String evidenceId;

    @Column(nullable = false)
    private String ledgerStatus; // SEALED, VERIFYING, CORRUPTED

    @Column(length = 1000)
    private String chainSignature;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
