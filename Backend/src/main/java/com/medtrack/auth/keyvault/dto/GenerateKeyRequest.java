package com.medtrack.auth.keyvault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateKeyRequest {

    @NotBlank(message = "Key alias is required")
    private String keyAlias;

    @NotBlank(message = "Algorithm is required")
    private String algorithm; // AES-256-GCM, RSA-4096, ECC-P384

    @NotBlank(message = "Key type is required")
    private String keyType; // SYMMETRIC, ASYMMETRIC, SIGNING
}
