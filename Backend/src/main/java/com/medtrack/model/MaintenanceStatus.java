package com.medtrack.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum MaintenanceStatus {
    SCHEDULED("Scheduled"),
    IN_PROGRESS("In Progress"),
    NEEDS_PART("Needs Part"),
    ON_HOLD("On Hold"),
    COMPLETED("Completed");

    private final String displayName;

    MaintenanceStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static MaintenanceStatus fromValue(String value) {
        return Arrays.stream(values())
                .filter(status -> status.displayName.equalsIgnoreCase(value)
                        || status.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown maintenance status: " + value));
    }
}
