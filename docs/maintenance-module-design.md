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

`MaintenanceTask` is the current JPA entity for maintenance records. It maps to the `maintenance_tasks` table and stores task details such as task code, equipment name, hospital name, deadline, assigned technician, priority, status, notes, hours worked, and parts used. Its `status` field uses the strongly typed `MaintenanceStatus` enum and is persisted with `EnumType.STRING`. It also stores `hospitalId`, which is populated by the backend and used as a stable ownership key.

The task now keeps the existing API-facing equipment code/name fields and also stores a lazy `ManyToOne` relationship to the real `Equipment` record. The relationship uses `equipment_record_id` so it can coexist with the legacy string field without breaking the frontend contract. Technician assignment remains an email string, but scheduling now verifies that a supplied account exists and has the technician role.

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
- creating one recurring task only when a task transitions to `COMPLETED`
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

The controller forwards the authenticated identity to the service, uses role guards for every operation, and validates positive IDs for item-level operations. The list endpoint is already automatically scoped to the authenticated hospital or technician.

Scheduling requests now use Bean Validation. Technician updates use service-level validation because their partial payload intentionally does not contain required scheduling fields. Optional status and equipment filters are not yet exposed.

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
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "equipment_record_id")
private Equipment equipmentRecord;
```

The relationship remains nullable temporarily so existing database rows can be backfilled before a non-null constraint is introduced.

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

### Completed on 2026-07-14

1. [x] **Connected maintenance to real equipment and secured scheduling.** Added a lazy equipment relationship and an ownership-scoped history query. Scheduling resolves either the canonical equipment code or, only when no matching code exists, the numeric ID currently sent by the UI. It verifies hospital ownership without reinterpreting another hospital's numeric-looking equipment code, validates required fields and technician roles, and replaces all client-supplied identity/ownership values with server values.
2. [x] **Validated technician updates and recurrence.** Technician report fields persist, negative hours/recurrence are rejected, status transitions follow the documented lifecycle, completed records are immutable, and recurrence is created exactly once on the transition to `COMPLETED`.

Focused verification is implemented in `MaintenanceServiceTest`: owned-equipment scheduling, cross-hospital rejection, technician ownership, negative-hour rejection, completion immutability, recurrence creation, calendar export, scoped lists, and scoped deletion.

### Recommended future work

- [ ] Add controller integration tests for validation and role guards.
- [ ] Add optional status and equipment filters without weakening ownership scoping.
- [ ] Decide whether to add a `CANCELLED` status.
- [ ] Replace the technician email string with a direct `User` relationship.
- [ ] Add a database migration/backfill for legacy maintenance rows before making the equipment relationship non-nullable.
- [ ] Connect and verify the hospital maintenance list page against the backend API.

## Definition Of Done For Design Step

- Current Maintenance module is documented.
- Existing limitations are identified.
- Target entity relationship is clear.
- Status lifecycle is defined.
- API behavior is defined.
- Validation and security rules are listed.
- The completed enum refactor is documented in `docs/maintenance-status-enum.md`.
