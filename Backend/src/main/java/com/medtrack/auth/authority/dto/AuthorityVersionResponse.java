package com.medtrack.auth.authority.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Data Transfer Object representing a user's current security authority state and version.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityVersionResponse {

    private Long userId;
    private String email;
    private String username;
    private String role;
    private Long authorityVersion;
    private Set<String> permissions;
    private boolean active;
    private String message;
}
