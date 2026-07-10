package com.medtrack.auth.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginEvent {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String loginTime;
}
