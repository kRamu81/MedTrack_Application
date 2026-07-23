package com.medtrack.auth.authority.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Enterprise Audit Entity tracking all Security Authority events, authority version increments,
 * role re-assignments, and permission changes within the MedTrack system.
 */
@Entity
@Table(name = "authority_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String eventType; // e.g. VERSION_INCREMENT, GLOBAL_BUMP, PERMISSION_GRANT, PERMISSION_REVOKE

    @Column(nullable = false, length = 1000)
    private String description;

    private Long previousAuthorityVersion;

    private Long newAuthorityVersion;

    @Column(nullable = false)
    private String updatedBy;

    @org.hibernate.annotations.CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
