package com.medtrack.supplier.security;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link SupplierAccessGuard}, the shared authorization check used by the
 * supplier order and shipment controllers/services to confirm a caller may only act on
 * their own supplier account unless they hold the HOSPITAL administrator role.
 */
@ExtendWith(MockitoExtension.class)
public class SupplierAccessGuardTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SupplierAccessGuard supplierAccessGuard;

    private Authentication authenticationFor(String email, String role) {
        return new UsernamePasswordAuthenticationToken(email, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
    }

    @Test
    void resolveCallerId_LooksUpByEmailNotUsername() {
        // Spring Security's principal name is the user's email (per SecurityConfig's
        // UserDetailsService), so this must go through findByEmail - a prior bug looked
        // up by username instead and silently fell back to a hardcoded ID.
        Authentication supplier = authenticationFor("supplier@medtrack.org", "supplier");
        User user = User.builder().id(30L).email("supplier@medtrack.org").username("different-username").build();
        when(userRepository.findByEmail("supplier@medtrack.org")).thenReturn(Optional.of(user));

        assertEquals(30L, supplierAccessGuard.resolveCallerId(supplier));
    }

    @Test
    void allowsHospitalAdminRegardlessOfTargetSupplier() {
        Authentication admin = authenticationFor("admin@medtrack.org", "hospital");

        assertDoesNotThrow(() -> supplierAccessGuard.assertSelfOrHospitalAdmin(admin, 999L));
    }

    @Test
    void allowsSupplierActingOnOwnAccount() {
        Authentication self = authenticationFor("supplier@medtrack.org", "supplier");
        User user = User.builder().id(30L).email("supplier@medtrack.org").build();
        when(userRepository.findByEmail("supplier@medtrack.org")).thenReturn(Optional.of(user));

        assertDoesNotThrow(() -> supplierAccessGuard.assertSelfOrHospitalAdmin(self, 30L));
    }

    @Test
    void rejectsSupplierActingOnAnotherSuppliersAccount() {
        Authentication other = authenticationFor("supplier@medtrack.org", "supplier");
        User user = User.builder().id(30L).email("supplier@medtrack.org").build();
        when(userRepository.findByEmail("supplier@medtrack.org")).thenReturn(Optional.of(user));

        assertThrows(AccessDeniedException.class,
                () -> supplierAccessGuard.assertSelfOrHospitalAdmin(other, 999L));
    }

    @Test
    void threeArgOverload_SkipsCheckWhenNoSupplierAssignedYet() {
        Authentication supplier = authenticationFor("supplier@medtrack.org", "supplier");

        // assignedSupplierId == null means no one has been assigned to the order/shipment
        // yet - the first supplier to act on it should be allowed through.
        assertDoesNotThrow(() -> supplierAccessGuard.assertSelfOrHospitalAdmin(supplier, 30L, null));
    }

    @Test
    void threeArgOverload_RejectsMismatchedAssignedSupplier() {
        Authentication supplier = authenticationFor("supplier@medtrack.org", "supplier");

        assertThrows(AccessDeniedException.class,
                () -> supplierAccessGuard.assertSelfOrHospitalAdmin(supplier, 30L, 999L));
    }

    @Test
    void threeArgOverload_AllowsHospitalAdminEvenWhenMismatched() {
        Authentication admin = authenticationFor("admin@medtrack.org", "hospital");

        assertDoesNotThrow(() -> supplierAccessGuard.assertSelfOrHospitalAdmin(admin, 30L, 999L));
    }
}
