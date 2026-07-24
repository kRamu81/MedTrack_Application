package com.medtrack.auth.zerotrust.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityPolicyViolationResponse {
    private Long id;
    private Long userId;
    private String username;
    private String ipAddress;
    private String violationType;
    private String severity;
    private String description;
    private boolean resolved;
    private LocalDateTime timestamp;
}
