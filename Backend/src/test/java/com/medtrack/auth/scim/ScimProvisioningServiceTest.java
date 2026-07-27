package com.medtrack.auth.scim;

import com.medtrack.auth.scim.dto.*;
import com.medtrack.auth.scim.model.*;
import com.medtrack.auth.scim.repository.*;
import com.medtrack.auth.scim.service.ScimProvisioningService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ScimProvisioningService}.
 */
@ExtendWith(MockitoExtension.class)
public class ScimProvisioningServiceTest {

    @Mock
    private ScimProvisioningPolicyRepository policyRepository;

    @Mock
    private ScimUserMappingRepository userMappingRepository;

    @Mock
    private ScimProvisioningAuditLogRepository auditLogRepository;

    private ScimProvisioningService scimService;

    @BeforeEach
    void setUp() {
        scimService = new ScimProvisioningService(policyRepository, userMappingRepository, auditLogRepository);
    }

    @Test
    void getActivePolicy_Success() {
        ScimProvisioningPolicy policy = ScimProvisioningPolicy.builder()
                .id(1L)
                .policyName("MASTER_SCIM_POLICY")
                .primaryIdpProvider("OKTA")
                .defaultDeprovisionAction("SUSPEND")
                .autoSyncEnabled(true)
                .updatedAt(LocalDateTime.now())
                .build();

        when(policyRepository.findByPolicyName("MASTER_SCIM_POLICY")).thenReturn(Optional.of(policy));

        ScimPolicyResponse response = scimService.getActivePolicy();

        assertNotNull(response);
        assertEquals("OKTA", response.getPrimaryIdpProvider());
        assertEquals("SUSPEND", response.getDefaultDeprovisionAction());
    }

    @Test
    void provisionScimUser_Success() {
        when(userMappingRepository.findByScimExternalId("okta-999")).thenReturn(Optional.empty());
        when(userMappingRepository.save(any())).thenAnswer(i -> {
            ScimUserMapping m = i.getArgument(0);
            m.setId(1L);
            return m;
        });

        ProvisionScimUserRequest request = ProvisionScimUserRequest.builder()
                .scimExternalId("okta-999")
                .medtrackUsername("alice.smith")
                .email("alice@medtrack.org")
                .enterpriseIdpProvider("OKTA")
                .assignedRole("HOSPITAL_ADMIN")
                .build();

        ScimUserMappingResponse response = scimService.provisionScimUser(request);

        assertNotNull(response);
        assertEquals("alice.smith", response.getMedtrackUsername());
        assertEquals("PROVISIONED", response.getSyncStatus());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void deprovisionScimUser_Success() {
        ScimUserMapping mapping = ScimUserMapping.builder()
                .id(1L)
                .scimExternalId("okta-999")
                .medtrackUsername("alice.smith")
                .syncStatus("PROVISIONED")
                .build();

        when(userMappingRepository.findByScimExternalId("okta-999")).thenReturn(Optional.of(mapping));
        when(userMappingRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DeprovisionScimUserRequest request = DeprovisionScimUserRequest.builder()
                .scimExternalId("okta-999")
                .deprovisionReason("Employee departure")
                .build();

        ScimUserMappingResponse response = scimService.deprovisionScimUser(request);

        assertNotNull(response);
        assertEquals("SUSPENDED", response.getSyncStatus());
        verify(auditLogRepository, times(1)).save(any());
    }
}
