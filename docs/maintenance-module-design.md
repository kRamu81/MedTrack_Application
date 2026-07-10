# Maintenance Module Design

## Current State

The project already contains a basic Maintenance Scheduling module. It is implemented as a simple CRUD flow using these backend files:

- `model/MaintenanceTask.java`
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

`MaintenanceTask` is the current JPA entity for maintenance records. It maps to the `maintenance_tasks` table and stores task details such as task code, equipment name, hospital name, deadline, assigned technician, priority, status, notes, hours worked, and parts used.

Current limitation: equipment, hospital, and technician details are mostly stored as plain text. The task is not yet properly connected to the `Equipment` entity through a database relationship.

### MaintenanceTaskRepository.java

`MaintenanceTaskRepository` extends `JpaRepository`, so it already supports basic database operations like save, find all, find by id, and delete by id.

It also defines simple query methods:

- `findByTaskCode(String taskCode)`
- `findByAssignedTechnician(String assignedTechnician)`
- `findByStatus(String status)`

Current limitation: it does not yet provide equipment-based, hospital-based, or strongly user-based maintenance queries.

### MaintenanceService.java

`MaintenanceService` contains the current business logic for maintenance tasks.

It currently supports:

- fetching all tasks
- fetching one task by id
- scheduling a task
- updating a task
- deleting a task

Current limitation: scheduling does not verify that the equipment exists, does not check hospital ownership, does not validate status values, and does not verify technician assignment. Updating also does not currently persist all technician report fields consistently.

### MaintenanceController.java

`MaintenanceController` exposes the REST API under `/api/maintenance`.

Current endpoints:

- `GET /api/maintenance`
- `GET /api/maintenance/{id}`
- `POST /api/maintenance`
- `PUT /api/maintenance/{id}`
- `DELETE /api/maintenance/{id}`

Current limitation: the controller is a thin CRUD layer. It does not yet support filtered queries such as technician-specific or equipment-specific maintenance records.

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

Maintenance status should eventually be controlled through an enum instead of free text.

Recommended statuses:

- `SCHEDULED`
- `IN_PROGRESS`
- `NEEDS_PART`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

Recommended lifecycle:

```text
SCHEDULED -> IN_PROGRESS -> COMPLETED
SCHEDULED -> CANCELLED
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

Future service-level checks should also ensure:

- hospitals only schedule maintenance for equipment they own
- technicians only update assigned tasks
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

1. Add a `MaintenanceStatus` enum.
2. Refactor `MaintenanceTask` to use the enum for status.
3. Improve `MaintenanceTask` relationship with `Equipment`.
4. Add repository query methods for filters.
5. Improve scheduling logic in `MaintenanceService`.
6. Improve technician update logic in `MaintenanceService`.
7. Add validation for required fields and invalid status transitions.
8. Improve exception messages and HTTP responses.
9. Verify role-based authorization using backend tests or Postman.
10. Connect the hospital maintenance list page to backend data.

## Definition Of Done For Design Step

- Current Maintenance module is documented.
- Existing limitations are identified.
- Target entity relationship is clear.
- Status lifecycle is defined.
- API behavior is defined.
- Validation and security rules are listed.
- No production code behavior is changed in this step.
