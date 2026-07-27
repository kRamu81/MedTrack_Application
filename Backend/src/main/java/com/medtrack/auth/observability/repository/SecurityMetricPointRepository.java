package com.medtrack.auth.observability.repository;

import com.medtrack.auth.observability.model.SecurityMetricPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityMetricPointRepository extends JpaRepository<SecurityMetricPoint, Long> {
    List<SecurityMetricPoint> findByMetricName(String metricName);
    List<SecurityMetricPoint> findByMetricCategory(String metricCategory);
}
