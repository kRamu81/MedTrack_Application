package com.medtrack.controller;

import com.medtrack.model.Hospital;
import com.medtrack.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    /**
     * Create a hospital profile linked to the authenticated user.
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<Hospital> createHospitalProfile(@Valid @RequestBody Hospital hospital) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            Hospital createdHospital = hospitalService.createHospitalProfile(hospital, userEmail);
            return new ResponseEntity<>(createdHospital, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}