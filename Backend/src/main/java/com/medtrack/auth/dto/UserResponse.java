package com.medtrack.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "User profile payload wrapped inside a successful authentication response")
public class UserResponse {

    @Schema(description = "Unique numeric database identifier of the user", example = "15")
    private Long id;

    @Schema(description = "Full name of the registered user", example = "John Doe")
    private String name;

    @Schema(description = "Primary registered email address", example = "john.doe@medtrack.com")
    private String email;

    @Schema(description = "Contact phone number", example = "+15551234567")
    private String phone;

    @Schema(description = "Name of the associated workspace hospital or supplier organization", example = "St. Mary Hospital")
    private String organization;

    @Schema(description = "Active system user access role (HOSPITAL, TECHNICIAN, or SUPPLIER)", example = "HOSPITAL")
    private String role;
}
