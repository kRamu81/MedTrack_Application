package com.medtrack.auth.keyvault.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoKeyResponse {
    private Long id;
    private String keyId;
    private String keyAlias;
    private String algorithm;
    private String keyType;
    private String state;
    private int version;
    private LocalDateTime activatedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime revokedAt;
}
