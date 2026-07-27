package com.medtrack.auth.evidence.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceAuditChainLogResponse {
    private Long id;
    private long blockIndex;
    private String currentHash;
    private String previousHash;
    private String evidenceId;
    private String ledgerStatus;
    private String chainSignature;
    private LocalDateTime timestamp;
}
