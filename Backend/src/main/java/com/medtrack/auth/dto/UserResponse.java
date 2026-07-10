package com.medtrack.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserResponse is a Data Transfer Object (DTO) that represents the user's basic profile details
 * returned inside a successful authentication response payload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String organization;
    private String role;
}
