package com.medtrack.auth.sso.controller;

import com.medtrack.auth.sso.dto.*;
import com.medtrack.auth.sso.service.SsoProviderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * =================================================================================================
 * SSO IDENTITY PROVIDERS REST CONTROLLER (SsoProviderController)
 * =================================================================================================
 * Exposes management APIs for configuring enterprise OAuth2 / SAML identity providers (Okta, Azure AD,
 * Google Workspace) and initiating SSO authentication flows.
 */
@RestController
@RequestMapping("/api/auth/sso")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Tag(name = "SSO Identity Providers", description = "Endpoints for enterprise OAuth2, SAML 2.0, and Okta/Azure SSO management.")
public class SsoProviderController {

    private final SsoProviderService ssoProviderService;

    @PostMapping("/configure")
    @Operation(summary = "Configure SSO Provider", description = "Onboards or updates an enterprise Identity Provider configuration for a domain.")
    public ResponseEntity<SsoProviderConfigResponse> configureProvider(@Valid @RequestBody SsoProviderConfigRequest request) {
        SsoProviderConfigResponse response = ssoProviderService.configureProvider(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/initiate")
    @Operation(summary = "Initiate SSO Login Flow", description = "Resolves corporate email domain to active SSO provider and returns authorization redirect URL.")
    public ResponseEntity<SsoLoginInitiateResponse> initiateSso(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        SsoLoginInitiateResponse response = ssoProviderService.initiateSsoLogin(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/providers")
    @Operation(summary = "List all Identity Providers", description = "Retrieves all configured SSO providers.")
    public ResponseEntity<List<SsoProviderConfigResponse>> getAllProviders() {
        List<SsoProviderConfigResponse> providers = ssoProviderService.getAllProviders();
        return ResponseEntity.ok(providers);
    }

    @PostMapping("/toggle/{providerId}")
    @Operation(summary = "Toggle SSO Provider state", description = "Enables or disables an identity provider.")
    public ResponseEntity<Map<String, Object>> toggleProvider(@PathVariable Long providerId, @RequestParam boolean enabled) {
        boolean toggled = ssoProviderService.toggleProviderState(providerId, enabled);
        return ResponseEntity.ok(Map.of(
                "success", toggled,
                "message", toggled ? "Provider state updated" : "Provider not found"
        ));
    }
}
