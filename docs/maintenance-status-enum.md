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

`EnumType.STRING` stores Java enum names in the database. Existing persistent rows containing display values such as `Scheduled` or `In Progress` may need a migration to `SCHEDULED` or `IN_PROGRESS`. The development H2 database is recreated and seeded, but a persistent MySQL database should be checked before deployment.

Example migration:

```sql
UPDATE maintenance_tasks SET status = 'SCHEDULED' WHERE status = 'Scheduled';
UPDATE maintenance_tasks SET status = 'IN_PROGRESS' WHERE status = 'In Progress';
```

## Remaining Work

- Define and enforce valid status transitions.
- Decide whether to add a `CANCELLED` status.
- Add tests for JSON conversion, persistence, and invalid values.
- Implement admin assignment and technician-specific progress updates.
