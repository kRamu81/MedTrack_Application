package com.medtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * MedTrack Application - Main Entry Point
 * Hospital Equipment Management System Backend
 * Runs on port 8081 to match frontend HttpService.js
 */
@SpringBootApplication
@EnableDiscoveryClient
public class
MedTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedTrackApplication.class, args);
    }
}
