package com.medtrack.auth.mfa.service;

import com.medtrack.auth.mfa.dto.RevokeDeviceRequest;
import com.medtrack.auth.mfa.dto.UserSessionDeviceResponse;
import com.medtrack.auth.mfa.model.UserSessionDevice;
import com.medtrack.auth.mfa.repository.UserSessionDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enterprise Service managing user session devices, geolocation metadata,
 * active device session tracking, and remote device revocation.
 */
@Service
@RequiredArgsConstructor
public class DeviceSessionService {

    private final UserSessionDeviceRepository deviceRepository;

    /**
     * Registers or updates an active device session for a user upon login or API access.
     *
     * @param userId user database primary key
     * @param userAgent HTTP request user-agent header string
     * @param ipAddress HTTP client IP address
     * @return updated {@link UserSessionDeviceResponse}
     */
    @Transactional
    public UserSessionDeviceResponse registerDeviceSession(Long userId, String userAgent, String ipAddress) {
        String deviceName = parseDeviceName(userAgent);
        String deviceFingerprint = UUID.nameUUIDFromBytes((userId + ":" + userAgent + ":" + ipAddress).getBytes()).toString();

        Optional<UserSessionDevice> existingDeviceOpt = deviceRepository.findByUserIdAndDeviceId(userId, deviceFingerprint);

        UserSessionDevice device;
        if (existingDeviceOpt.isPresent()) {
            device = existingDeviceOpt.get();
            device.setActive(true);
            device.setLastAccessedAt(LocalDateTime.now());
            device.setIpAddress(ipAddress);
        } else {
            device = UserSessionDevice.builder()
                    .userId(userId)
                    .deviceId(deviceFingerprint)
                    .deviceName(deviceName)
                    .ipAddress(ipAddress)
                    .location("San Francisco, CA, US")
                    .userAgent(userAgent != null ? userAgent : "Unknown Device")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .lastAccessedAt(LocalDateTime.now())
                    .build();
        }

        UserSessionDevice saved = deviceRepository.save(device);
        return mapToDeviceResponse(saved);
    }

    /**
     * Retrieves all active device sessions for a specified user.
     *
     * @param userId user identifier
     * @return list of active {@link UserSessionDeviceResponse} objects
     */
    @Transactional(readOnly = true)
    public List<UserSessionDeviceResponse> getActiveDevices(Long userId) {
        return deviceRepository.findByUserIdAndActiveTrueOrderByLastAccessedAtDesc(userId).stream()
                .map(this::mapToDeviceResponse)
                .collect(Collectors.toList());
    }

    /**
     * Revokes a targeted device session, setting active to false.
     *
     * @param request {@link RevokeDeviceRequest} containing userId and target deviceId
     * @return {@code true} if device session was successfully revoked
     */
    @Transactional
    public boolean revokeDeviceSession(RevokeDeviceRequest request) {
        Optional<UserSessionDevice> deviceOpt = deviceRepository.findByUserIdAndDeviceId(request.getUserId(), request.getDeviceId());
        if (deviceOpt.isPresent()) {
            UserSessionDevice device = deviceOpt.get();
            device.setActive(false);
            device.setRevokedAt(LocalDateTime.now());
            deviceRepository.save(device);
            return true;
        }
        return false;
    }

    /**
     * Revokes all active device sessions for a user except a specified current session.
     *
     * @param userId user identifier
     * @param currentDeviceId ID of the device session to keep active
     * @return count of revoked device sessions
     */
    @Transactional
    public int revokeAllOtherDevices(Long userId, String currentDeviceId) {
        List<UserSessionDevice> activeDevices = deviceRepository.findByUserIdAndActiveTrueOrderByLastAccessedAtDesc(userId);
        int count = 0;
        for (UserSessionDevice dev : activeDevices) {
            if (!dev.getDeviceId().equals(currentDeviceId)) {
                dev.setActive(false);
                dev.setRevokedAt(LocalDateTime.now());
                deviceRepository.save(dev);
                count++;
            }
        }
        return count;
    }

    /**
     * Helper mapping entity to DTO.
     */
    private UserSessionDeviceResponse mapToDeviceResponse(UserSessionDevice device) {
        return UserSessionDeviceResponse.builder()
                .id(device.getId())
                .userId(device.getUserId())
                .deviceId(device.getDeviceId())
                .deviceName(device.getDeviceName())
                .ipAddress(device.getIpAddress())
                .location(device.getLocation())
                .userAgent(device.getUserAgent())
                .active(device.isActive())
                .createdAt(device.getCreatedAt())
                .lastAccessedAt(device.getLastAccessedAt())
                .build();
    }

    /**
     * Helper to derive readable device/browser string from user-agent.
     */
    private String parseDeviceName(String userAgent) {
        if (userAgent == null) return "Desktop Workspace";
        if (userAgent.contains("Chrome")) return "Chrome Browser";
        if (userAgent.contains("Firefox")) return "Firefox Browser";
        if (userAgent.contains("Safari")) return "Safari Workstation";
        if (userAgent.contains("Edge")) return "Microsoft Edge";
        return "MedTrack Client Device";
    }
}
