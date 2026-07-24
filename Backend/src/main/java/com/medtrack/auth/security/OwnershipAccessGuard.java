package com.medtrack.auth.security;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Shared authorization guard for security-management endpoints (RBAC, MFA, device sessions,
 * SSO, authority versioning, audit) that accept a {@code userId} path variable.
 *
 * These endpoints let a caller act on any account's security state, so every method must
 * confirm the caller is either acting on their own account or holds the HOSPITAL
 * (administrator) role before the request reaches the underlying service.
 */
@Component
@RequiredArgsConstructor
public class OwnershipAccessGuard {

    private final UserRepository userRepository;

    /**
     * Confirms the authenticated caller may act on the given target user's security state.
     * Hospital administrators may act on any account; all other callers may only act on
     * their own account.
     *
     * @param authentication the authenticated caller
     * @param targetUserId   the user ID the request would operate on
     * @throws AccessDeniedException if the caller is neither the target user nor a HOSPITAL admin
     */
    public void assertSelfOrHospitalAdmin(Authentication authentication, Long targetUserId) {
        if (hasRole(authentication, "HOSPITAL")) {
            return;
        }
        User caller = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user could not be resolved"));
        if (!caller.getId().equals(targetUserId)) {
            throw new AccessDeniedException("You are not authorized to access this account's security data");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        String expected = "ROLE_" + role.toUpperCase();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equalsIgnoreCase(expected));
    }
}
