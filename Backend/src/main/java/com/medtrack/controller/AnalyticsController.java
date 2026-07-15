package com.medtrack.controller;

import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.dto.HospitalAnalyticsDto;
import com.medtrack.model.Hospital;
import com.medtrack.repository.HospitalRepository;
import com.medtrack.service.AnalyticsService;
import com.medtrack.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;

    @GetMapping("/hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<HospitalAnalyticsDto> getHospitalAnalytics(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hospital hospital = hospitalRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found"));

        return ResponseEntity.ok(analyticsService.getHospitalAnalytics(hospital.getId()));
    }
}
