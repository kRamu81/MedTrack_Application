# Maintenance Backend Migration and Verification

## Scope

This backend change makes every maintenance task reference a real equipment record.

It includes:

- Flyway dependencies and vendor-specific migration locations
- legacy maintenance status normalization
- `equipment_record_id` and `hospital_id` backfill
- a non-null equipment relationship
- corrected development seed relationships
- stable empty-list API responses
- maintenance controller and migration integration tests

## Migration Files

- `Backend/src/main/resources/db/migration/h2/V1__backfill_maintenance_equipment_relationship.sql`
- `Backend/src/main/resources/db/migration/mysql/V1__backfill_maintenance_equipment_relationship.sql`

The scripts:

1. Ensure the maintenance equipment relationship column exists.
2. Convert human-readable legacy status values to persisted enum names.
3. Match `maintenance_tasks.equipment_id` to `equipment.equipment_code`.
4. Respect an existing `hospital_id` while matching equipment.
5. Restore a missing `hospital_id` from the matched equipment record.
6. Make `equipment_record_id` non-nullable.

The final constraint is also a safety check. If any maintenance row cannot be matched to equipment, the migration fails instead of leaving a partially upgraded database.

## Pre-deployment Checks

Back up the persistent database before enabling the migration.

Check for unmatched maintenance records:

```sql
SELECT mt.id, mt.task_code, mt.equipment_id, mt.hospital_id
FROM maintenance_tasks mt
LEFT JOIN equipment e
  ON e.equipment_code = mt.equipment_id
 AND (mt.hospital_id IS NULL OR e.hospital_id = mt.hospital_id)
WHERE mt.equipment_record_id IS NULL
  AND e.id IS NULL;
```

Every returned row must be corrected by fixing its equipment code, hospital ownership, or missing equipment record before deployment.

Inspect the current status values:

```sql
SELECT DISTINCT status
FROM maintenance_tasks;
```

## Enabling Flyway

Flyway is disabled by default so the existing in-memory H2 development workflow can continue using Hibernate schema creation.

For an existing persistent schema:

1. Back up the database.
2. Run the unmatched-row checks above.
3. Set `FLYWAY_ENABLED=true`.
4. Start the backend and confirm Flyway reports migration version `1`.
5. Verify that every maintenance row has a non-null `equipment_record_id`.

The configuration uses `baseline-on-migrate=true` and baseline version `0`. This allows migration version `1` to run against the existing unversioned MedTrack schema.

For a completely empty database, first allow Hibernate to create the current schema with Flyway disabled. Then enable Flyway so the schema becomes versioned. A future full-schema Flyway baseline can replace this transitional bootstrap process.

## API Behavior Changes

`GET /api/maintenance` now always returns HTTP 200. When there are no tasks, its response is:

```json
[]
```

Method-level access denials are explicitly mapped to HTTP 403. This prevents `@PreAuthorize` failures from being handled by the generic runtime exception handler as HTTP 400.

## Seed Data

`DataInitializer` now:

- creates default users using idempotent email checks
- creates a hospital profile for the default hospital user
- assigns seeded equipment to that hospital
- assigns seeded maintenance tasks to the real equipment records
- stores the matching hospital ownership key
- assigns the in-progress task to the default technician email

The initializer can be disabled with:

```properties
app.data-initializer.enabled=false
```

Integration tests that manage their own database state disable it.

## Automated Verification

`MaintenanceMigrationIntegrationTest` verifies:

- display status conversion to the enum database value
- equipment relationship backfill
- hospital ownership backfill
- migration failure when equipment cannot be matched

`MaintenanceControllerIntegrationTest` verifies:

- hospital scheduling access
- technician scheduling denial
- technician update access
- hospital update denial
- hospital deletion access
- technician deletion denial
- Bean Validation failures
- invalid status JSON
- invalid lifecycle transitions
- positive resource ID validation
- stable empty-array responses
- hospital-only calendar export

`MaintenanceServiceTest` continues to verify ownership scoping, scheduling, lifecycle enforcement, recurrence, calendar output, and deletion behavior.

The complete backend Maven test suite passes after these changes.
