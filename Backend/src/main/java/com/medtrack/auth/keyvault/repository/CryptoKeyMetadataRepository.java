package com.medtrack.auth.keyvault.repository;

import com.medtrack.auth.keyvault.model.CryptoKeyMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CryptoKeyMetadataRepository extends JpaRepository<CryptoKeyMetadata, Long> {
    Optional<CryptoKeyMetadata> findByKeyId(String keyId);
    List<CryptoKeyMetadata> findByState(String state);
    List<CryptoKeyMetadata> findByKeyAlias(String keyAlias);
}
