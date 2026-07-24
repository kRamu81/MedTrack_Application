package com.medtrack.auth.security;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link OwnershipAccessGuard}, the shared authorization check used by the
 * RBAC, authority, MFA, device session, SSO, and audit controllers to confirm a caller may
 * only act on their own account unless they hold the HOSPITAL administrator role.
 */
@ExtendWith(MockitoExtension.class)
public class OwnershipAccessGuardTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OwnershipAccessGuard ownershipAccessGuard;

    private Authentication authenticationFor(String email, String role) {
        return new UsernamePasswordAuthenticationToken(email, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
    }

    @Test
    void allowsHospitalAdminRegardlessOfTargetUser() {
        Authentication admin = authenticationFor("admin@medtrack.org", "hospital");

        assertDoesNotThrow(() -> ownershipAccessGuard.assertSelfOrHospitalAdmin(admin, 999L));
    }

    @Test
    void allowsCallerActingOnOwnAccount() {
        Authentication self = authenticationFor("technician@medtrack.org", "technician");
        User user = User.builder().id(50L).email("technician@medtrack.org").role("technician").build();
        when(userRepository.findByEmail("technician@medtrack.org")).thenReturn(Optional.of(user));

        assertDoesNotThrow(() -> ownershipAccessGuard.assertSelfOrHospitalAdmin(self, 50L));
    }

    @Test
    void rejectsCallerActingOnAnotherAccount() {
        Authentication other = authenticationFor("technician@medtrack.org", "technician");
        User user = User.builder().id(50L).email("technician@medtrack.org").role("technician").build();
        when(userRepository.findByEmail("technician@medtrack.org")).thenReturn(Optional.of(user));

        assertThrows(AccessDeniedException.class,
                () -> ownershipAccessGuard.assertSelfOrHospitalAdmin(other, 999L));
    }

    @Test
    void rejectsWhenAuthenticatedUserCannotBeResolved() {
        Authentication unknown = authenticationFor("ghost@medtrack.org", "technician");
        when(userRepository.findByEmail("ghost@medtrack.org")).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> ownershipAccessGuard.assertSelfOrHospitalAdmin(unknown, 50L));
    }
}
