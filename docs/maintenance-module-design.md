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

Current limitation: equipment and technician details are still stored as strings. The task is not yet connected to the `Equipment` entity through a database relationship, and technician assignment is not connected to a `User` entity.

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

Current limitation: it does not yet provide equipment-based queries or strongly user-based technician queries.

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
- generating a task code when one is not supplied
- allowing a technician to update only a task assigned to their login email
- allowing a hospital to delete only its own task

Current limitation: scheduling does not verify that the equipment exists or belongs to the hospital, does not validate required fields, and does not verify technician assignment. Updating does not validate allowed status transitions or non-negative hours and does not currently persist `partsUsed`.

### MaintenanceController.java

`MaintenanceController` exposes the REST API under `/api/maintenance`.

Current endpoints:

- `GET /api/maintenance`
- `GET /api/maintenance/{id}`
- `POST /api/maintenance`
- `PUT /api/maintenance/{id}`
- `DELETE /api/maintenance/{id}`

The controller forwards the authenticated identity to the service, uses role guards for every operation, and validates positive IDs for item-level operations. The list endpoint is already automatically scoped to the authenticated hospital or technician.

Current limitation: the controller does not expose optional status or equipment filters and does not apply request-body validation.

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

Future backend mapping should use:

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "equipment_id", nullable = false)
private Equipment equipment;
```

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

Future service-level checks should also ensure:

- hospitals only schedule maintenance for equipment they own
- assigned technician accounts exist and have the technician role
- unauthenticated users cannot access maintenance records

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

### Next two tasks

1. [ ] **Connect maintenance to real equipment and validate scheduling.** Replace the string-only equipment reference with a `@ManyToOne` relationship, add equipment-based repository queries, and make `scheduleTask` reject missing equipment, equipment that does not exist, or equipment owned by another hospital.
2. [ ] **Complete and validate technician updates.** Persist `partsUsed`, reject negative `hoursWorked`, enforce the documented status transitions, and prevent normal edits after completion.

### Implementation structure for the next two tasks

Only the Maintenance entity, repository, service, and controller need to be changed for this implementation. `EquipmentRepository` already provides `findByEquipmentCode` and `findByIdAndHospitalId`, so the Maintenance service can consume those existing methods without changing the Equipment module.

#### `MaintenanceTask` entity

- Add a lazy `@ManyToOne` reference to `Equipment` using a dedicated join column.
- Keep the current API-facing `equipmentId` and `equipment` values during this step so the existing frontend contract is not broken. In the current data, `equipmentId` is an equipment code such as `EQ-001`, not the numeric database primary key.
- Make `deadline` and `maintenanceType` required.
- Add a non-negative constraint for `hoursWorked`.
- Keep the existing `MaintenanceStatus` enum and server-controlled hospital ownership.

#### `MaintenanceTaskRepository`

- Keep all existing ownership-scoped methods.
- Add an equipment relationship query for maintenance history.
- Add combined ownership filters only when needed, for example hospital plus status or hospital plus equipment. Every filtered query must remain hospital- or technician-scoped.

#### `MaintenanceService`

- During scheduling, resolve `task.equipmentId` through `EquipmentRepository.findByEquipmentCode`.
- Compare the resolved equipment's hospital ID with the authenticated hospital ID before saving.
- Set the real equipment relationship and server-derived hospital fields; never trust hospital ownership from request JSON.
- Validate required scheduling fields and technician assignment before saving.
- During technician updates, copy only allowed fields: `status`, `notes`, `hoursWorked`, and `partsUsed`.
- Enforce status transitions in one service method so all callers follow the same lifecycle.
- Reject negative hours and reject normal updates once a task is completed.

#### `MaintenanceController`

- Keep the existing `/api/maintenance` paths and role guards.
- Add `@Valid` to scheduling and update request bodies after entity constraints are added.
- Continue passing `Authentication` into the service; do not accept hospital or technician ownership as controller query parameters.
- Keep the current positive-ID checks and response status codes.

#### Verification required before commit

- A hospital can schedule maintenance only for its own equipment code.
- A different hospital cannot read, schedule against, or delete that maintenance record.
- A technician can read and update only an assigned task.
- Valid status transitions succeed; invalid transitions and negative hours return `400`.
- `partsUsed` persists after an update.
- Existing maintenance endpoint paths and human-readable status JSON remain compatible.

### Work after the next two tasks

- [ ] Verify assigned technicians exist and have the technician role.
- [ ] Add request validation and consistent validation error responses.
- [ ] Add maintenance repository, service, and controller tests for ownership and status transitions.
- [ ] Add optional status and equipment filters without weakening ownership scoping.
- [ ] Decide whether to add a `CANCELLED` status.
- [ ] Connect and verify the hospital maintenance list page against the backend API.

## Definition Of Done For Design Step

- Current Maintenance module is documented.
- Existing limitations are identified.
- Target entity relationship is clear.
- Status lifecycle is defined.
- API behavior is defined.
- Validation and security rules are listed.
- The completed enum refactor is documented in `docs/maintenance-status-enum.md`.
