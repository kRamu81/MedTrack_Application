# Maintenance Backend Migration and Verification

## Scope

These backend migrations make every maintenance task reference a real equipment record and add an auditable completion timestamp.

It includes:

- Flyway dependencies and vendor-specific migration locations
- legacy maintenance status normalization
- `equipment_record_id` and `hospital_id` backfill
- a non-null equipment relationship
- corrected development seed relationships
- stable empty-list API responses
- maintenance controller and migration integration tests
- server-controlled maintenance completion timestamps

## Migration Files

- `Backend/src/main/resources/db/migration/h2/V1__backfill_maintenance_equipment_relationship.sql`
- `Backend/src/main/resources/db/migration/mysql/V1__backfill_maintenance_equipment_relationship.sql`
- `Backend/src/main/resources/db/migration/h2/V2__add_maintenance_completion_timestamp.sql`
- `Backend/src/main/resources/db/migration/mysql/V2__add_maintenance_completion_timestamp.sql`
- `Backend/src/main/resources/db/migration/h2/V3__enforce_maintenance_record_integrity.sql`
- `Backend/src/main/resources/db/migration/mysql/V3__enforce_maintenance_record_integrity.sql`
- `Backend/src/main/resources/db/migration/h2/V4__link_maintenance_technician_identity.sql`
- `Backend/src/main/resources/db/migration/mysql/V4__link_maintenance_technician_identity.sql`

The scripts:

1. Ensure the maintenance equipment relationship column exists.
2. Convert human-readable legacy status values to persisted enum names.
3. Match `maintenance_tasks.equipment_id` to `equipment.equipment_code`.
4. Respect an existing `hospital_id` while matching equipment.
5. Restore a missing `hospital_id` from the matched equipment record.
6. Make `equipment_record_id`, `hospital_id`, and `status` non-nullable.
7. Add a restrictive foreign key from maintenance history to equipment.
8. Add the nullable `assigned_technician_record_id` relationship.
9. Backfill technician relationships using normalized legacy assignment emails.
10. Add a user foreign key with `ON DELETE SET NULL` so historical email evidence is retained.

The final constraint is also a safety check. If any maintenance row cannot be matched to equipment, the migration fails instead of leaving a partially upgraded database.

Migration version `2` adds the nullable `completed_at` column. Existing completed records are intentionally not backfilled because their actual completion time cannot be derived safely. New completion transitions populate it from the server clock, and SLA reporting excludes legacy completed rows where it is null.

Migration version `3` rejects records whose hospital ownership cannot be restored and prevents
equipment deletion from orphaning maintenance history. The foreign key uses restrictive delete
behavior; maintenance evidence is never cascade-deleted with equipment.

Migration version `4` links assigned maintenance work to the stable `users.id` identity. The
existing `assigned_technician` email column is retained for API compatibility and historical
display. Backfill matching trims and lowercases both values. Unmatched assignments remain
unlinked and recoverable through the hospital assignment endpoint. Deleting a user clears only
the relationship through `ON DELETE SET NULL`; it does not erase the historical email.

The database constraints make both ownership fields present and ensure that
`equipment_record_id` references real equipment, but they do not by themselves compare
`maintenance_tasks.hospital_id` with the linked equipment's `hospital_id`. Maintenance repository
queries therefore enforce both ownership paths on hospital and technician access, and the service
checks the same invariant before saving direct or recurring tasks. Operators should still repair
any inconsistent legacy rows rather than relying on them remaining inaccessible.

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

Check for unresolved ownership before version `3`:

```sql
SELECT id, task_code, equipment_record_id
FROM maintenance_tasks
WHERE hospital_id IS NULL OR status IS NULL;
```

Inspect legacy assignments that cannot be linked before version `4`:

```sql
SELECT mt.id, mt.task_code, mt.assigned_technician
FROM maintenance_tasks mt
LEFT JOIN users u
  ON LOWER(TRIM(u.email)) = LOWER(TRIM(mt.assigned_technician))
WHERE mt.assigned_technician IS NOT NULL
  AND u.id IS NULL;
```

These rows do not block migration. They remain visible to the owning hospital and can be linked
through the existing assignment endpoint.

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
4. Start the backend and confirm Flyway reports migration version `4`.
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
- assigns the in-progress task to both the default technician identity and canonical email

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
- migration failure when hospital ownership cannot be restored
- restrictive retention when referenced equipment deletion is attempted
- case-insensitive technician relationship backfill
- preservation of the historical assignment email when a user is deleted

`MaintenanceControllerIntegrationTest` verifies:

- hospital scheduling access
- hospital assignment access and technician assignment denial
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

`MaintenanceServiceTest` continues to verify ownership scoping, scheduling, locked hospital
assignment, lifecycle enforcement, recurrence, calendar output, locked deletion, and
completed-record retention. It also verifies
that mismatched task/equipment hospital ownership is rejected, supplied technician emails are
normalized and replaced with the canonical active account email, and a recurrence is left
unassigned when the former technician is missing, locked, disabled, or no longer eligible.
New assignments persist both the canonical email and stable user relationship, while technician
repository access and write locks use the authenticated user ID.

`MaintenanceRequestValidationTest` verifies that create, assignment, and technician-update
payloads reject missing or oversized values against the explicit Maintenance persistence limits.
`MaintenanceServiceTest` also verifies normalization of equipment lookup values, technician
emails, and stored maintenance types.

`MaintenanceTaskRepositoryTest` initializes only the Maintenance JPA repository and verifies
against H2 that all hospital-, technician-, lock-, and equipment-history queries exclude an
inconsistent ownership row while retaining a valid row. The same test verifies that status
totals, completed-task SLA inputs, average work hours, and critical-pending analytics also exclude
rows whose task hospital disagrees with the linked equipment hospital.

It also verifies that completion requires an effective technician signature, accepts a previously stored signature when a partial completion payload omits the field, rejects an explicit blank signature, records `completedAt`, and preserves hospital-owned recurrence configuration during technician updates. Dedicated request DTOs now prevent client binding of completion timestamps and other server-controlled fields. `AnalyticsServiceTest` verifies that SLA compliance uses actual completion timestamps and excludes unverifiable legacy completions.

The Maintenance entity/DTO/repository/service/controller dependency slice and the affected
Maintenance test sources compile in isolation. The focused service, request-validation,
repository, and migration suites pass 36 tests after the 2026-07-27 ownership and technician
identity changes. The controller integration test source also compiles.

The normal Maven build currently stops during main compilation on unrelated missing imports for
`Value` and `LockedException` in `auth/service/UserService.java`, before Maven can execute the
Maintenance suites. The seed initializer also retains pre-existing Equipment category type
errors when compiled in isolation. Those application-wide blockers remain outside this
Maintenance-only change.
