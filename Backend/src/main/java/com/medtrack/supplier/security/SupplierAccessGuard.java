package com.medtrack.supplier.security;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Shared authorization guard for supplier-facing order and shipment endpoints that accept
 * a {@code supplierId}, or that resolve the caller's own supplier identity implicitly.
 *
 * These endpoints let a caller act on any supplier's orders and shipments, so every method
 * must confirm the caller is either acting on their own supplier account or holds the
 * HOSPITAL (administrator) role before the request reaches the underlying service.
 */
@Component
@RequiredArgsConstructor
public class SupplierAccessGuard {

    private final UserRepository userRepository;

    /**
     * Resolves the authenticated caller's own user/supplier ID.
     *
     * <p>Spring Security's principal name (from {@link Authentication#getName()}) is the
     * user's email, per {@code SecurityConfig}'s {@code UserDetailsService}, so the lookup
     * must go through {@link UserRepository#findByEmail}.
     *
     * @throws AccessDeniedException if the authenticated user cannot be resolved
     */
    public Long resolveCallerId(Authentication authentication) {
        User caller = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user could not be resolved"));
        return caller.getId();
    }

    /**
     * Confirms the authenticated caller may act on the given target supplier's data.
     * Hospital administrators may act on any supplier; all other callers may only act on
     * their own supplier account.
     *
     * @throws AccessDeniedException if the caller is neither the target supplier nor a HOSPITAL admin
     */
    public void assertSelfOrHospitalAdmin(Authentication authentication, Long targetSupplierId) {
        if (isHospitalAdmin(authentication)) {
            return;
        }
        if (!resolveCallerId(authentication).equals(targetSupplierId)) {
            throw new AccessDeniedException("You are not authorized to access this supplier's data");
        }
    }

    /**
     * Confirms the given supplier ID (e.g. the supplier already assigned to an order or
     * shipment) matches the authenticated caller, unless the caller is a HOSPITAL admin.
     */
    public void assertSelfOrHospitalAdmin(Authentication authentication, Long callerId, Long assignedSupplierId) {
        if (isHospitalAdmin(authentication) || assignedSupplierId == null) {
            return;
        }
        if (!assignedSupplierId.equals(callerId)) {
            throw new AccessDeniedException("You are not authorized to access this supplier's data");
        }
    }

    public boolean isHospitalAdmin(Authentication authentication) {
        return hasRole(authentication, "HOSPITAL");
    }

    private boolean hasRole(Authentication authentication, String role) {
        String expected = "ROLE_" + role.toUpperCase();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equalsIgnoreCase(expected));
    }
}
