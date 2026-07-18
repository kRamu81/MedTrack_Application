# Maintenance Module Design

## Current State

The project already contains a basic Maintenance Scheduling module. It is implemented as a simple CRUD flow using these backend files:

- `model/MaintenanceTask.java`
- `model/MaintenanceStatus.java`
- `repository/MaintenanceTaskRepository.java`
- `service/MaintenanceService.java`
- `controller/MaintenanceController.java`

The frontend also already has Maintenance-related pages and API helpers:

- `src/services/MaintenanceService.js`
- `src/pages/hospital/ScheduleMaintenancePage.jsx`
- `src/pages/hospital/MaintenanceSchedule.jsx`
- `src/pages/technician/TaskList.jsx`
- `src/pages/technician/UpdateTask.jsx`

The current backend can create, fetch, update, and delete maintenance tasks through `/api/maintenance` endpoints.

## What The Existing Files Do

### MaintenanceTask.java

`MaintenanceTask` is the current JPA entity for maintenance records. It maps to the `maintenance_tasks` table and stores task details such as task code, equipment name, hospital name, deadline, assigned technician, priority, status, notes, hours worked, parts used, signature, and the server-recorded completion timestamp. Its `status` field uses the strongly typed `MaintenanceStatus` enum and is persisted with `EnumType.STRING`. It also stores `hospitalId`, which is populated by the backend and used as a stable ownership key.

The task keeps the existing API-facing equipment code/name fields and also stores a lazy, required `ManyToOne` relationship to the real `Equipment` record. The relationship uses `equipment_record_id` so it can coexist with the legacy string field without breaking the frontend contract. A versioned Flyway migration backfills legacy rows before enforcing the non-null relationship. Technician assignment remains an email string, but scheduling verifies that a supplied account exists and has the technician role.

### MaintenanceTaskRepository.java

`MaintenanceTaskRepository` extends `JpaRepository`, so it already supports basic database operations like save, find all, find by id, and delete by id.

It also defines simple query methods:

- `findByTaskCode(String taskCode)`
- `findByAssignedTechnician(String assignedTechnician)`
- `findByHospitalId(Long hospitalId)`
- `findByIdAndHospitalId(Long id, Long hospitalId)`
- `findByIdAndAssignedTechnician(Long id, String assignedTechnician)`
- `findByStatus(MaintenanceStatus status)`

The hospital and technician ownership queries are already used by the service to prevent one user from reading or changing another user's tasks.

An ownership-scoped equipment-history query is now available through `findByEquipmentRecord_IdAndHospitalId`. Technician queries remain email-based because the authenticated technician identity and current frontend assignment field are both emails.

### MaintenanceStatus.java

`MaintenanceStatus` defines the supported task states:

- `SCHEDULED`
- `IN_PROGRESS`
- `NEEDS_PART`
- `ON_HOLD`
- `COMPLETED`

The enum uses Jackson conversion annotations so the REST API continues to accept and return the human-readable values already used by the frontend, such as `"Scheduled"` and `"In Progress"`. Invalid status text is rejected instead of being stored as arbitrary data.

### MaintenanceService.java

`MaintenanceService` contains the current business logic for maintenance tasks.

It currently supports:

- fetching only the authenticated hospital's or technician's tasks
- fetching one task only when it belongs to the authenticated hospital or assigned technician
- scheduling a task with hospital ownership derived from the authenticated user
- always generating the task code on the server
- allowing a technician to update only a task assigned to their login email
- allowing a hospital to delete only its own task
- resolving maintenance against equipment owned by the authenticated hospital
- validating scheduling fields and assigned technician accounts
- enforcing the documented status lifecycle and non-negative work values
- preventing edits after completion
- persisting technician reports including parts and signatures
- requiring technician sign-off and recording `completedAt` on the transition to `COMPLETED`
- creating one recurring task only when a task transitions to `COMPLETED`
- serializing technician updates to the same task so concurrent completion requests cannot create duplicate recurrences
- exporting hospital tasks as an iCalendar feed

Current limitation: the API still uses the entity as its request model, although the service clears client-controlled identity, ownership, status, and report fields before insert. Dedicated create/update DTOs can be introduced later if the public API expands.

### MaintenanceController.java

`MaintenanceController` exposes the REST API under `/api/maintenance`.

Current endpoints:

- `GET /api/maintenance`
- `GET /api/maintenance/{id}`
- `POST /api/maintenance`
- `PUT /api/maintenance/{id}`
- `DELETE /api/maintenance/{id}`
- `GET /api/maintenance/export/calendar.ics`

The controller forwards the authenticated identity to the service, uses role guards for every operation, and validates positive IDs for item-level operations. The list endpoint is automatically scoped to the authenticated hospital or technician and consistently returns HTTP 200 with a JSON array, including `[]` when no tasks exist.

Scheduling requests now use Bean Validation. Technician updates use service-level validation because their partial payload intentionally does not contain required scheduling fields. Optional status and equipment filters are not yet exposed.

Controller integration tests verify scheduling, updates, deletion, empty lists, invalid payloads, invalid status text and transitions, positive ID validation, role guards, and hospital-only calendar export. Method-security failures are mapped to HTTP 403 instead of being converted to a generic HTTP 400 response.

## Target Design

The Maintenance module should become the bridge between Equipment Inventory and Technician Operations.

Expected workflow:

1. A hospital user creates or owns equipment.
2. The hospital schedules maintenance for an existing equipment item.
3. A technician views assigned maintenance tasks.
4. The technician updates task progress, notes, hours worked, and parts used.
5. The hospital can review maintenance status and history.

## Entity Relationship Design

The intended relationship is:

```text
Hospital -> Equipment -> MaintenanceTask
```

Recommended mapping:

```text
One Equipment can have many MaintenanceTask records.
Many MaintenanceTask records belong to one Equipment.
```

The backend mapping now uses a dedicated relationship field while retaining the legacy API fields:

```java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "equipment_record_id", nullable = false)
private Equipment equipmentRecord;
```

The relationship is now non-nullable. Existing rows are upgraded through the vendor-specific Flyway migration before the entity constraint is applied.

The relationship is excluded from Lombok-generated `toString`, `equals`, and `hashCode` traversal. This avoids accidentally initializing the lazy equipment proxy or recursing through connected JPA entities while preserving the legacy JSON contract through `@JsonIgnore`.

This will make maintenance records depend on real equipment records instead of only storing equipment details as strings.

## Status Lifecycle

Maintenance status is now controlled through the `MaintenanceStatus` enum instead of free text.

Recommended statuses:

- `SCHEDULED`
- `IN_PROGRESS`
- `NEEDS_PART`
- `ON_HOLD`
- `COMPLETED`

`CANCELLED` is not currently implemented and can be added later when cancellation behavior is defined.

Recommended lifecycle:

```text
SCHEDULED -> IN_PROGRESS -> COMPLETED
IN_PROGRESS -> NEEDS_PART
IN_PROGRESS -> ON_HOLD
NEEDS_PART -> IN_PROGRESS
ON_HOLD -> IN_PROGRESS
```

## API Design

The existing endpoint base path should remain unchanged:

```text
/api/maintenance
```

Keeping this path avoids breaking the current frontend service.

Recommended API behavior:

- `POST /api/maintenance`: hospital schedules maintenance for equipment
- `GET /api/maintenance`: authenticated users fetch maintenance tasks
- `GET /api/maintenance/{id}`: authenticated users fetch one task
- `PUT /api/maintenance/{id}`: technician updates maintenance progress
- `DELETE /api/maintenance/{id}`: hospital deletes or cancels maintenance

Recommended future filters:

```text
GET /api/maintenance?technicianId=...
GET /api/maintenance?status=...
GET /api/maintenance?equipmentId=...
```

## Validation Rules

Scheduling should validate:

- equipment id is present
- equipment exists
- deadline is present
- maintenance type is present
- priority is valid
- assigned technician exists if technician assignment is required
- assigned technician has technician role

Updating should validate:

- task exists
- status is valid
- completed tasks should not be edited casually
- completion requires a nonblank technician signature
- completion time is generated by the server and cannot be supplied by a client
- hours worked cannot be negative
- only technicians should update technician report fields

## Security Rules

Current Spring Security already protects Maintenance APIs by role:

```text
GET     authenticated users
POST    hospital users
PUT     technician users
DELETE  hospital users
```

Current service-level checks ensure:

- hospitals can list, read, and delete only their own maintenance tasks
- technicians can list, read, and update only tasks assigned to their login email
- hospital ownership is derived from the authenticated user rather than request JSON

Additional future security work can replace the email assignment string with a direct `User` relationship. Unauthenticated access remains enforced by Spring Security.

## Integration Notes

Maintenance should depend on Equipment. It should not directly depend on Supplier Operations or Equipment Orders.

The current frontend field names should be preserved unless frontend changes are included in the same work. Important fields currently expected by the frontend include:

- `id`
- `taskCode`
- `equipmentId`
- `equipment`
- `hospital`
- `maintenanceType`
- `deadline`
- `assignedTechnician`
- `description`
- `priority`
- `status`
- `notes`
- `hoursWorked`
- `partsUsed`
- `signature`
- `completedAt` (response field controlled by the server)

## Next Implementation Steps

### Verified completed

- [x] Add a `MaintenanceStatus` enum.
- [x] Refactor `MaintenanceTask.status` to use `MaintenanceStatus` with `EnumType.STRING`.
- [x] Add a server-controlled `hospitalId` ownership key to `MaintenanceTask`.
- [x] Add hospital-, technician-, and status-based repository query methods.
- [x] Scope list and item reads to the authenticated hospital or assigned technician.
- [x] Derive the scheduling hospital from the authenticated user instead of request JSON.
- [x] Scope task deletion to the authenticated hospital.
- [x] Scope technician updates to tasks assigned to the authenticated technician.
- [x] Persist technician updates for `status`, `notes`, and `hoursWorked`.
- [x] Apply controller role guards and positive-ID validation.
- [x] Link new maintenance tasks to hospital-owned equipment records.
- [x] Validate scheduling fields and technician assignment.
- [x] Prevent client-controlled task identity, ownership, and initial report state.
- [x] Enforce valid status transitions, non-negative work values, and completion immutability.
- [x] Prevent duplicate recurring tasks after completion.
- [x] Require technician sign-off and persist the actual completion timestamp.
- [x] Calculate maintenance SLA compliance from actual completion timestamps.
- [x] Add a Flyway migration that normalizes legacy statuses and backfills equipment/hospital ownership.
- [x] Make the `equipmentRecord` relationship non-nullable after the migration.
- [x] Update seed data to create real hospital, equipment, and maintenance relationships.
- [x] Return HTTP 200 with an empty array for an empty maintenance list.
- [x] Add maintenance controller integration tests for validation and role guards.
- [x] Add migration integration tests for successful backfill and unmatched legacy records.

### Completed on 2026-07-14

1. [x] **Connected maintenance to real equipment and secured scheduling.** Added a lazy equipment relationship and an ownership-scoped history query. Scheduling resolves either the canonical equipment code or, only when no matching code exists, the numeric ID currently sent by the UI. It verifies hospital ownership without reinterpreting another hospital's numeric-looking equipment code, validates required fields and technician roles, and replaces all client-supplied identity/ownership values with server values.
2. [x] **Validated technician updates and recurrence.** Technician report fields persist, negative hours/recurrence are rejected, status transitions follow the documented lifecycle, completed records are immutable, and recurrence is created exactly once on the transition to `COMPLETED`.

Focused verification is implemented in `MaintenanceServiceTest`: owned-equipment scheduling, cross-hospital rejection, technician ownership, negative-hour rejection, completion immutability, recurrence creation, calendar export, scoped lists, and scoped deletion.

### Completed on 2026-07-16

1. [x] **Added a versioned maintenance database backfill.** Flyway support and H2/MySQL migration scripts normalize legacy status strings, resolve `equipment_record_id` from the canonical equipment code, restore `hospital_id` from equipment ownership when necessary, and enforce a required equipment relationship. The migration intentionally fails when a legacy task cannot be matched, preventing silent data loss or an invalid relationship state.
2. [x] **Hardened the backend maintenance API contract.** Empty task lists now return HTTP 200 with `[]`, access-denied exceptions return HTTP 403, seeded data uses real hospital/equipment relationships, and controller integration tests cover the maintenance endpoints and role boundaries.

Migration behavior is verified by `MaintenanceMigrationIntegrationTest`. Controller and method-security behavior is verified by `MaintenanceControllerIntegrationTest`. The complete backend Maven test suite passes.

### Completed on 2026-07-17

1. [x] **Made completed maintenance records auditable.** A transition to `COMPLETED` now requires a nonblank technician signature and records a server-controlled `completedAt` timestamp. Scheduling clears any client-supplied completion timestamp.
2. [x] **Corrected SLA reporting.** Analytics now compares the real completion date with the task deadline. Legacy completed rows without a trustworthy timestamp remain readable but are excluded from the SLA denominator instead of receiving an invented completion date.

The nullable completion column is introduced by Flyway migration version `2`. Completion validation and timestamp ownership are covered by `MaintenanceServiceTest`; SLA calculation is covered by `AnalyticsServiceTest`.

### Completed on 2026-07-18

1. [x] **Made recurring completion concurrency-safe.** Technician updates now load the assigned maintenance row with a database `PESSIMISTIC_WRITE` lock inside the existing transaction. Concurrent completion requests therefore serialize: the first request completes the task and creates its recurrence, while the next request observes the completed immutable state and cannot create another recurrence.
2. [x] **Hardened RFC 5545 calendar output.** Calendar text now escapes backslashes, commas, semicolons, and line breaks; `DTSTAMP` is generated from an actual UTC instant; and content lines are folded at 75 UTF-8 octets without splitting Unicode code points. The endpoint path, media type, filename, and event fields remain compatible.

Lock selection and calendar escaping, UTC formatting, injection resistance, Unicode handling, and line-length behavior are covered by `MaintenanceServiceTest`.

### Recommended future work

- [ ] Add optional status and equipment filters without weakening ownership scoping.
- [ ] Decide whether to add a `CANCELLED` status.
- [ ] Replace the technician email string with a direct `User` relationship.
- [ ] Connect and verify the hospital maintenance list page against the backend API.

## Definition Of Done For Design Step

- Current Maintenance module is documented.
- Existing limitations are identified.
- Target entity relationship is clear.
- Status lifecycle is defined.
- API behavior is defined.
- Validation and security rules are listed.
- The completed enum refactor is documented in `docs/maintenance-status-enum.md`.
