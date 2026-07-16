# Maintenance Status Enum Implementation

## Overview

Maintenance task status is now represented by the `MaintenanceStatus` enum rather than an unrestricted `String`. This gives the backend a defined set of valid states while preserving the status labels currently used by the frontend.

## Supported Statuses

| Java enum value | API JSON value |
| --- | --- |
| `SCHEDULED` | `Scheduled` |
| `IN_PROGRESS` | `In Progress` |
| `NEEDS_PART` | `Needs Part` |
| `ON_HOLD` | `On Hold` |
| `COMPLETED` | `Completed` |

## Files Changed

### `Backend/src/main/java/com/medtrack/model/MaintenanceStatus.java`

New enum containing the supported statuses. `@JsonValue` writes display values in API responses, and `@JsonCreator` accepts either display values such as `"In Progress"` or enum names such as `"IN_PROGRESS"` in requests.

### `Backend/src/main/java/com/medtrack/model/MaintenanceTask.java`

The `status` field changed from:

```java
private String status = "Scheduled";
```

to:

```java
@Enumerated(EnumType.STRING)
@Builder.Default
private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;
```

JPA therefore stores enum names such as `SCHEDULED` and `IN_PROGRESS`, and new tasks default to `SCHEDULED`.

### `Backend/src/main/java/com/medtrack/config/DataInitializer.java`

Seed tasks now use `MaintenanceStatus.SCHEDULED` and `MaintenanceStatus.IN_PROGRESS` instead of string literals.

### `Backend/src/main/java/com/medtrack/repository/MaintenanceTaskRepository.java`

The status query now accepts the enum:

```java
List<MaintenanceTask> findByStatus(MaintenanceStatus status);
```

Example:

```java
maintenanceTaskRepository.findByStatus(MaintenanceStatus.IN_PROGRESS);
```

## API Compatibility

Existing frontend request data remains valid:

```json
{
  "status": "In Progress"
}
```

The backend also returns the same human-readable value:

```json
{
  "status": "In Progress"
}
```

Unknown values such as `"Started"` are rejected because they are not members of the enum.

## Database Consideration

`EnumType.STRING` stores Java enum names in the database. Existing persistent rows containing display values such as `Scheduled` or `In Progress` are now normalized by the versioned maintenance migration.

The migration handles all currently supported display values:

```text
Scheduled    -> SCHEDULED
In Progress -> IN_PROGRESS
Needs Part  -> NEEDS_PART
On Hold     -> ON_HOLD
Completed   -> COMPLETED
```

Vendor-specific scripts are stored under:

- `Backend/src/main/resources/db/migration/h2/`
- `Backend/src/main/resources/db/migration/mysql/`

The same migration backfills the required `equipment_record_id` relationship and missing `hospital_id` values. It fails when a legacy task cannot be matched to equipment, so operators must resolve unmatched rows instead of silently deploying incomplete data.

Flyway is enabled with `FLYWAY_ENABLED=true`. It remains disabled by default because the current local H2 workflow still lets Hibernate create a new development schema. Deployment and verification steps are recorded in `docs/maintenance-backend-migration.md`.

## Remaining Work

- Decide whether to add a `CANCELLED` status.
- Consider replacing email-based technician assignment with a direct user relationship.

Invalid JSON status values are covered by the maintenance controller integration tests. Migration persistence and unmatched-row behavior are covered by `MaintenanceMigrationIntegrationTest`.

## Lifecycle Enforcement

The maintenance service now enforces these transitions:

```text
SCHEDULED -> IN_PROGRESS
IN_PROGRESS -> NEEDS_PART | ON_HOLD | COMPLETED
NEEDS_PART -> IN_PROGRESS
ON_HOLD -> IN_PROGRESS
```

Technicians may update report fields without changing a non-completed status, but completed tasks are immutable. Negative work hours are rejected, and recurring maintenance is generated only on the first transition to `COMPLETED`.
