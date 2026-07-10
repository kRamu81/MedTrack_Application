package com.medtrack.supplier.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Baseline configuration for the Supplier Operations & Logistics Service.
 * Exposes core configuration settings and registers initialization logs.
 */
@Configuration
public class SupplierConfig {

    private static final Logger log = LoggerFactory.getLogger(SupplierConfig.class);

    @PostConstruct
    public void init() {
        log.info(">> Supplier Operations & Logistics Service Foundation initialized.");
    }
}
