package com.medtrack.auth.rbac.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response DTO returning permission evaluation result for a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionCheckResponse {

    private Long userId;
    private String roleName;
    private String permissionCode;
    private boolean granted;
    private List<String> allGrantedPermissions;
    private String message;
}
