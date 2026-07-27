package com.medtrack.auth.scim.repository;

import com.medtrack.auth.scim.model.ScimUserMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScimUserMappingRepository extends JpaRepository<ScimUserMapping, Long> {
    Optional<ScimUserMapping> findByScimExternalId(String scimExternalId);
    Optional<ScimUserMapping> findByMedtrackUsername(String medtrackUsername);
    List<ScimUserMapping> findBySyncStatus(String syncStatus);
    List<ScimUserMapping> findByEnterpriseIdpProvider(String enterpriseIdpProvider);
}
