package com.medtrack.auth.sso.repository;

import com.medtrack.auth.sso.model.SsoIdentityProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for managing persistent SSO Identity Provider configurations.
 */
@Repository
public interface SsoIdentityProviderRepository extends JpaRepository<SsoIdentityProvider, Long> {

    /**
     * Finds active SSO provider matching a corporate domain key (e.g., "stjude.org").
     *
     * @param domainKey corporate email domain
     * @return Optional containing SsoIdentityProvider if configured and enabled
     */
    Optional<SsoIdentityProvider> findByDomainKeyAndEnabledTrue(String domainKey);

    /**
     * Finds provider by domain key regardless of enabled state.
     *
     * @param domainKey corporate domain string
     * @return Optional identity provider entity
     */
    Optional<SsoIdentityProvider> findByDomainKey(String domainKey);

    /**
     * Finds all enabled identity providers.
     *
     * @return list of active providers
     */
    List<SsoIdentityProvider> findByEnabledTrue();
}
