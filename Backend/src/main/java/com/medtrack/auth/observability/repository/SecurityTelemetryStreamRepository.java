package com.medtrack.auth.observability.repository;

import com.medtrack.auth.observability.model.SecurityTelemetryStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityTelemetryStreamRepository extends JpaRepository<SecurityTelemetryStream, Long> {
    Optional<SecurityTelemetryStream> findByStreamId(String streamId);
    List<SecurityTelemetryStream> findByStreamSource(String streamSource);
    List<SecurityTelemetryStream> findByStreamStatus(String streamStatus);
}
