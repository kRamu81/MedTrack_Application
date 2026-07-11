# MEDTRACK ENTERPRISE
### Cloud-Native Medical Equipment Lifecycle Management Platform
*Microservice Architecture & Engineering Team Charter*

**Tech Stack:** React 18 • Redux Toolkit | Spring Boot 3 • Spring Cloud | MySQL • Redis • Elasticsearch | Apache Kafka | Docker • Kubernetes

**Engineering Group of 10** • 10 Owned Microservices • Event-Driven Architecture

Prepared for: Product Engineering Team
Case Study 06 • Document Version 2.0 (Corporate Edition)
July 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements Matrix](#4-functional-requirements-matrix)
5. [Quick Reference — All Assignments](#5-quick-reference--all-assignments)
6. [Detailed Breakdown Per Member](#6-detailed-breakdown-per-member)
7. [Cross-Service Event Flow](#7-cross-service-event-flow)
8. [Delivery Timeline & Build Order](#8-delivery-timeline--build-order)
9. [Definition of Done — Quality Standard](#9-definition-of-done--quality-standard)

---

## 1. Executive Summary

Hospital networks manage thousands of high-value medical assets — imaging machines, ventilators, infusion pumps, and monitors — across multiple facilities. Today this is largely tracked through spreadsheets and manual phone calls, which leads to three costly, real-world failures: (1) equipment sits unmonitored until it breaks, causing unplanned clinical downtime; (2) preventive maintenance is missed because no system proactively reminds staff or technicians; and (3) procurement from suppliers is slow and untracked, delaying replacement parts during emergencies.

MedTrack Enterprise is a cloud-native, event-driven microservice platform that digitizes the full equipment lifecycle — from onboarding and inventory tracking, to preventive maintenance scheduling, technician field service, and supplier procurement — with real-time alerts, analytics, and a full audit trail for regulatory compliance (HIPAA-aligned data handling practices). The platform is built for horizontal scale across hospital networks and is designed, from day one, around independently deployable services, asynchronous communication, and observability — the same architectural patterns used in production healthcare and enterprise SaaS systems.

### 1.1 Business Goals

- Reduce unplanned equipment downtime by proactively tracking maintenance SLAs and warranty windows.
- Give hospital administrators real-time visibility into equipment health, cost, and order status via analytics dashboards.
- Automate technician dispatch and field service record-keeping, replacing paper checklists.
- Streamline supplier procurement with a transparent, status-driven order-to-delivery workflow.
- Maintain a tamper-evident audit log of every state-changing action for compliance audits.
- Support multi-hospital, multi-branch networks on a single scalable, containerized platform.

---

## 2. Technology Stack

The platform technology footprint has been expanded beyond a monolithic CRUD app into a production-grade, event-driven microservice ecosystem. Every backend service is independently containerized, registered with service discovery, and documented via OpenAPI.

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Redux Toolkit, React Query, React Router, Axios, Tailwind CSS, Recharts, Formik + Yup, STOMP/SockJS (WebSocket), Jest + React Testing Library, Cypress (E2E), Storybook |
| **Backend Services** | Java 17, Spring Boot 3, Spring Data JPA, Spring Security, Spring Cloud Gateway, Spring Cloud Config Server, Netflix Eureka, Feign Clients, springdoc-openapi (Swagger) |
| **Authentication** | OAuth2 Resource Server, JWT (access + refresh tokens), BCrypt password hashing, Bucket4j rate limiting |
| **Data & Caching** | MySQL 8 (primary datastore), Redis (caching & token/session store), Elasticsearch (equipment search), Flyway (DB migrations) |
| **Messaging / Events** | Apache Kafka (event-driven inter-service communication), Dead-Letter Queue handling for failed events |
| **File & Document Handling** | Multipart file upload, AWS S3-compatible object storage (MinIO for local dev), iText / JasperReports (PDF invoices & reports) |
| **Notifications** | SendGrid (email), Twilio (SMS), WebSocket push notifications, ZXing (QR code generation) |
| **DevOps & Infrastructure** | Docker, Docker Compose, Kubernetes + Helm charts, GitHub Actions (CI/CD), NGINX Ingress |
| **Observability** | Spring Boot Actuator, Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana) for centralized logging |
| **Testing & QA** | JUnit 5, Mockito, Testcontainers (integration tests), SonarQube (code quality gate), Postman/Newman (API contract tests) |

---

## 3. System Architecture

MedTrack follows a domain-driven microservice architecture. Each service owns a single bounded context and its own database schema, communicating synchronously via REST/Feign for request-response needs and asynchronously via Kafka for domain events (e.g., an order being placed, a maintenance task becoming overdue).

### 3.1 Architectural Principles

- **Single Responsibility:** each microservice owns exactly one business domain and its data.
- **API Gateway:** all client traffic enters through a single Spring Cloud Gateway edge service, which handles routing, CORS, and rate limiting.
- **Service Discovery:** Netflix Eureka allows services to locate each other dynamically without hard-coded URLs.
- **Centralized Configuration:** Spring Cloud Config Server externalizes environment-specific properties (dev/staging/prod).
- **Event-Driven Communication:** Kafka topics decouple services so that, for example, the Notification Service reacts to events without the Order Service knowing it exists.
- **Resilience:** Resilience4j circuit breakers and retries prevent cascading failures between dependent services.
- **Containerized Deployment:** every service ships with a Dockerfile and is orchestrated via Kubernetes for horizontal scaling.
- **Observability by Default:** structured logs, health checks, and metrics are wired in from day one, not bolted on later.

---

## 4. Functional Requirements Matrix

| ID | Requirement | Description |
|---|---|---|
| FR-01 | Facility & Multi-Branch Hospital Management | Onboard hospital facilities, manage branch hierarchies and admin profiles. |
| FR-02 | Equipment Inventory & Lifecycle Management | Track equipment from purchase through retirement, including QR-based asset IDs. |
| FR-03 | Preventive Maintenance Scheduling | Recurring and on-demand maintenance workflows with SLA/priority tracking. |
| FR-04 | Technician Field Service Operations | Mobile-friendly task queue, digital sign-off, and parts-used tracking. |
| FR-05 | Equipment Procurement & Order Management | Budget-approved ordering workflow with PDF purchase orders. |
| FR-06 | Supplier Fulfillment & Logistics | Status-driven order fulfillment with shipment tracking and ETAs. |
| FR-07 | Authentication, Authorization & Security | OAuth2/JWT authentication, RBAC, brute-force protection. |
| FR-08 | Real-Time Notifications & Alerts | Email, SMS, and in-app push alerts for critical events. |
| FR-09 | Analytics, Reporting & Business Intelligence | Downtime, SLA compliance, and cost-trend dashboards. |
| FR-10 | Audit Logging & Regulatory Compliance | Immutable audit trail of every state-changing action. |

---

## 5. Quick Reference — All Assignments

10 Team Members • 10 Owned Microservices • Every member ships backend/frontend, tests, docs, and container config for their service.

| Member | Microservice | Scope | FR Coverage | Key Responsibility |
|---|---|---|---|---|
| Member 1 | 🔐 User Authentication & Security Service | Backend | FR-07, FR-10 | Owns identity, JWT session management, and security hardening across every role and endpoint. |
| Member 2 | 🏥 Hospital / Facility Management Service | Backend | FR-01 | Owns hospital and multi-branch facility records that Equipment, Maintenance, and Order services depend on. |
| Member 3 | 🩺 Equipment Inventory Service | Backend | FR-02 | Owns the equipment catalog, QR asset tags, and searchable inventory used by Maintenance and Order services. |
| Member 4 | 🗓️ Maintenance Scheduling Service | Backend | FR-03 | Owns recurring and on-demand maintenance workflows with SLA-driven escalation. |
| Member 5 | 🔩 Technician Field Operations Service | Backend | FR-04 | Owns technician-facing task queue, digital sign-off, and field evidence capture. |
| Member 6 | 📦 Equipment Procurement & Order Service | Backend | FR-05 | Owns the hospital-side order-to-approval workflow and purchase order generation. |
| Member 7 | 🚚 Supplier Operations & Logistics Service | Backend | FR-06 | Owns supplier-facing fulfillment, shipment tracking, and performance scoring. |
| Member 8 | 🖥️ Frontend — Auth, Shared Services & Notifications | Frontend | FR-07, FR-08 | Builds the auth experience, the shared API/service layer, and the real-time notification client used platform-wide. |
| Member 9 | 📋 Frontend — Hospital Dashboard & Analytics UI | Frontend | FR-01, FR-02, FR-03, FR-05, FR-09 | Builds hospital-facing pages plus the analytics dashboards for equipment, maintenance, and cost insights. |
| Member 10 | 📱 Frontend — Technician & Supplier UI | Frontend | FR-04, FR-06 | Builds the technician field-service UI and supplier logistics dashboards, including offline-friendly PWA support. |

---

## 6. Detailed Breakdown Per Member

Each member owns their microservice end-to-end: domain model, business logic, REST API, security rules, automated tests, API documentation, and containerization. This mirrors how real engineering teams ship production services.

### 🔐 Member 1 — User Authentication & Security Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-07, FR-10 | User.java, RefreshToken.java | Spring Security, OAuth2 Resource Server, JWT (access + refresh), Redis, Bucket4j, Kafka producer |

*Owns identity for all three roles. Issues short-lived access tokens and rotating refresh tokens, secures every downstream endpoint with role guards, and publishes identity events for the audit trail.*

**Deliverables & Tasks**
- entity/User.java — id, username, password (BCrypt), email, role (HOSPITAL / TECHNICIAN / SUPPLIER), accountStatus
- POST /api/auth/register and POST /api/auth/login — issue JWT access token + refresh token pair
- POST /api/auth/refresh-token — silent token renewal; POST /api/auth/logout — Redis token blacklist
- Password-reset via one-time email code (integrates with the Notification pipeline over Kafka)
- Account lockout after 5 failed login attempts, with configurable cool-down window
- Spring Security configuration + JWT filter chain + method-level @PreAuthorize role guards
- Bucket4j rate limiting on auth endpoints to mitigate brute-force and credential-stuffing attacks
- Publish UserRegisteredEvent / UserLoginEvent to Kafka topic user-events for the audit log
- Swagger/OpenAPI documentation and JUnit5 + Mockito unit tests (target ≥80% coverage)
- Dockerfile, Spring Actuator health endpoint, and Eureka client registration

### 🏥 Member 2 — Hospital / Facility Management Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-01 | Hospital.java, HospitalBranch.java | Spring Data JPA, Redis caching, Flyway, Feign, springdoc-openapi |

*Owns the hospital/facility profile that Equipment, Maintenance, and Order services all depend on, including support for multi-branch hospital networks.*

**Deliverables & Tasks**
- entity/Hospital.java — id, name, location, branchType, licenseNumber, contactPerson, List<Equipment> equipmentList
- Multi-branch modeling: parent-child hospital network relationships for hospital chains
- POST /api/hospital/create, PUT /api/hospital/update/{id}, GET /api/hospital/{id}
- GET /api/hospital/search — paginated, filterable by name/location/branch type
- Redis caching layer for frequently accessed hospital profiles (10-minute TTL) to cut DB load
- getHospitalByUserId() exposed as a Feign client consumed by Equipment, Maintenance, and Order services
- Soft-delete / deactivate flow for hospital profiles to satisfy data-retention compliance
- Flyway migration scripts for versioned schema changes across environments
- controller/HospitalController.java with full CRUD + unit/integration tests
- Swagger docs, Dockerfile, Eureka client registration

### 🩺 Member 3 — Equipment Inventory Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-02 | Equipment.java, EquipmentCategory.java | Elasticsearch, ZXing (QR codes), Redis, Kafka producer, springdoc-openapi |

*Owns the equipment catalog end to end — from onboarding and QR-based physical tagging to full-text search — acting as the source of truth for Maintenance and Order services.*

**Deliverables & Tasks**
- entity/Equipment.java — id, name, category, manufacturer, serialNumber, purchaseDate, warrantyExpiry, status, Hospital hospital
- Auto-generate a unique QR code per equipment item for physical asset scanning (ZXing)
- Elasticsearch indexing for fast full-text search and multi-field filtering (category, status, manufacturer)
- Low-stock and warranty-expiry threshold checks that publish InventoryAlertEvent to Kafka
- Equipment lifecycle states: ACTIVE → UNDER_MAINTENANCE → RETIRED → DISPOSED
- Bulk equipment import via CSV upload for onboarding an entire hospital's existing inventory
- GET /api/hospital/equipment — paginated, filterable listing; getEquipmentById() Feign client for other services
- One-to-Many relationship: Hospital has many Equipment items, cascade-safe on hospital deactivation
- JUnit5/Mockito unit tests and Testcontainers-based integration tests against MySQL + Elasticsearch
- Swagger docs, Dockerfile, Eureka client registration

### 🗓️ Member 4 — Maintenance Scheduling Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-03 | Maintenance.java, MaintenanceSchedule.java | Quartz Scheduler, Kafka producer, springdoc-openapi |

*Owns the maintenance workflow, including recurring preventive-maintenance jobs and SLA-based escalation when tasks go overdue.*

**Deliverables & Tasks**
- entity/Maintenance.java — id, scheduledDate, completedDate, priority, status, notes, Equipment equipment
- service/MaintenanceService.java — scheduleMaintenance(), getAllMaintenance(), updateMaintenance()
- Quartz Scheduler jobs for recurring preventive maintenance (e.g., every 90 days per equipment class)
- Priority levels (LOW / MEDIUM / HIGH / CRITICAL) with SLA timers per priority tier
- Status lifecycle: PENDING → IN_PROGRESS → COMPLETED → OVERDUE (auto-flagged by a scheduled job)
- Escalation: publish MaintenanceOverdueEvent to Kafka so the Notification pipeline alerts the hospital admin
- POST /api/hospital/maintenance/schedule?equipmentId= and paginated GET /api/hospital/maintenance
- iCal export endpoint so hospital admins can sync maintenance schedules to external calendars
- Unit tests covering scheduling edge cases (overlapping tasks, overdue detection)
- Swagger docs, Dockerfile, Eureka client registration

### 🔩 Member 5 — Technician Field Operations Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-04 | Maintenance.java (technician ops), ServiceRecord.java | Multipart file upload, object storage client, Kafka consumer, springdoc-openapi |

*Provides the full technician workflow: viewing assigned tasks, capturing field evidence, and closing out work orders with a digital sign-off.*

**Deliverables & Tasks**
- controller/TechnicianController.java exposing all technician-facing endpoints
- GET /api/technician/maintenance — paginated task queue, filterable by priority and status
- PUT /api/technician/maintenance/update/{id} — status, completedDate, and resolution notes
- Digital sign-off capture: technician signature stored against the completed service record
- Parts-used tracking on each service record, auto-deducting consumed parts from Equipment inventory
- Photo/document upload for before/after maintenance evidence, stored via the File & Document service
- Kafka consumer listening for MaintenanceAssignedEvent to auto-populate the technician's queue
- Only the TECHNICIAN role can access these endpoints, enforced by Spring Security method guards
- updateMaintenanceRecord() in MaintenanceService.java with full unit test coverage
- Swagger docs, Dockerfile, Eureka client registration

### 📦 Member 6 — Equipment Procurement & Order Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-05 | Order.java, OrderRepository.java, PurchaseOrderPdf.java | Kafka producer, iText/JasperReports (PDF), springdoc-openapi |

*Owns the hospital-side procurement workflow, including a budget-approval gate and automatically generated purchase-order documents.*

**Deliverables & Tasks**
- entity/Order.java — id, orderDate, status, quantity, unitCost, totalCost, approvalStatus, Equipment equipment
- repository/OrderRepository.java — findAll(), findByStatus(), findByEquipment(), findByDateRange()
- Budget-approval workflow: orders above a configurable cost threshold require Hospital Admin sign-off
- POST /api/hospital/order?equipmentId= — creates the order and publishes OrderPlacedEvent to Kafka
- Auto-generated PDF purchase order / invoice document via iText, downloadable by the hospital
- Multi-item, cart-style batch ordering so a hospital can order for several equipment types at once
- Order created with status = PENDING, orderDate auto-set to current timestamp on creation
- Cost-analytics feed exposed for the Analytics dashboard (spend by hospital, by equipment category)
- Unit tests for approval-threshold logic and Kafka event publication
- Swagger docs, Dockerfile, Eureka client registration

### 🚚 Member 7 — Supplier Operations & Logistics Service

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Backend | FR-06 | Order.java (supplier ops), ShipmentTracking.java | Kafka consumer/producer, Resilience4j, springdoc-openapi |

*Provides the supplier-facing side of fulfillment: reacting to incoming demand, updating shipment status, and tracking on-time delivery performance.*

**Deliverables & Tasks**
- controller/SupplierController.java exposing all supplier-facing endpoints
- GET /api/supplier/orders — paginated, filterable by status (PENDING / CONFIRMED / SHIPPED / DELIVERED)
- PUT /api/supplier/order/update/{orderId}?newStatus= — advances the status-driven fulfillment workflow
- Shipment tracking number and estimated-delivery-date fields surfaced to the hospital
- Kafka consumer subscribes to OrderPlacedEvent; publishes OrderShippedEvent / OrderDeliveredEvent on updates
- Supplier performance scoring (on-time delivery rate) feeding the Analytics dashboard
- Delivery-delay detection publishes an alert consumed by the Notification pipeline
- Only the SUPPLIER role can access these endpoints, enforced by Spring Security
- Resilience4j circuit breaker around any downstream calls to protect against cascading failure
- Swagger docs, Dockerfile, Eureka client registration

### 🖥️ Member 8 — Frontend — Auth, Shared Services & Notifications

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Frontend | FR-07, FR-08 | LoginPage.jsx, RegistrationPage.jsx, NotificationBell.jsx | Redux Toolkit, Axios interceptors, STOMP/SockJS, Formik + Yup, Jest + RTL |

*Builds the authentication experience and the shared frontend service layer that every other page in the platform is built on top of, plus the real-time notification client.*

**Deliverables & Tasks**
- LoginPage.jsx and RegistrationPage.jsx with role selector (HOSPITAL / TECHNICIAN / SUPPLIER) and Yup validation
- services/AuthService.js — login, registration, refresh-token silent renewal, logout
- services/HttpService.js — Axios instance with request interceptor attaching the JWT and response interceptor handling 401s
- Redux Toolkit auth slice with persisted session state and protected-route guards per role
- WebSocket client (STOMP over SockJS) subscribing to the Notification service for real-time in-app alerts
- NotificationBell.jsx — dropdown of live alerts (overdue maintenance, order shipped, account events)
- Global error-boundary and toast notification system shared across the whole app
- Reusable design-system components (buttons, inputs, cards) documented in Storybook
- Jest + React Testing Library unit tests for auth flows and the shared service layer
- Responsive layout with Tailwind CSS, accessible (WCAG-AA) form components

### 📋 Member 9 — Frontend — Hospital Dashboard & Analytics UI

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Frontend | FR-01, FR-02, FR-03, FR-05, FR-09 | Hospital dashboard pages, analytics widgets | React Query, Recharts, React Router, Formik + Yup, Cypress |

*Builds every hospital-facing page — from facility onboarding through equipment, maintenance and ordering — plus the analytics dashboards hospital admins use to monitor their fleet.*

**Deliverables & Tasks**
- CreateHospitalForm.jsx / BranchSwitcher.jsx — facility profile creation and multi-branch navigation
- AddEquipmentForm.jsx — new equipment onboarding with QR code preview and CSV bulk-import UI
- EquipmentInventoryPage.jsx — paginated, filterable, searchable equipment table (React Query + debounced search)
- ScheduleMaintenancePage.jsx — equipment picker, priority selector, and recurring-schedule configuration
- RequestEquipmentPage.jsx — cart-style multi-item order placement with live cost total and approval status
- AnalyticsDashboardPage.jsx — Recharts widgets for equipment downtime %, maintenance SLA compliance, spend trend
- OrderHistoryPage.jsx — purchase-order PDF download links and order status timeline
- Skeleton loading states and optimistic UI updates for all mutating actions
- Cypress end-to-end tests covering the full hospital admin happy path
- Full responsive layout with Tailwind CSS and reusable chart components

### 📱 Member 10 — Frontend — Technician & Supplier UI

| Scope | FR Coverage | Core Entities / Files | Key Technologies |
|---|---|---|---|
| Frontend | FR-04, FR-06 | Technician & Supplier dashboard pages | React Query, Recharts, signature-pad, service worker (PWA), Cypress |

*Builds the technician field-service experience and the supplier logistics dashboard, including offline-friendly support for technicians working in areas with poor connectivity.*

**Deliverables & Tasks**
- MaintenancePage.jsx — technician task list with priority/status badges and offline caching via service worker
- UpdateMaintenancePage.jsx — status/notes update form plus a signature-pad component for digital sign-off
- PhotoUploadWidget.jsx — before/after maintenance evidence capture, queued for upload when connectivity returns
- OrdersPage.jsx — supplier view of all equipment orders with current status and shipment tracking timeline
- UpdateOrderStatusPage.jsx — supplier advances order status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- SupplierPerformancePage.jsx — Recharts widget showing on-time delivery rate over time
- Progressive Web App configuration (installable, offline shell) tailored for field technicians
- Notification preference settings page (email / SMS / push toggles per user)
- Cypress end-to-end tests covering the technician and supplier happy paths
- Full responsive layout with Tailwind CSS, tuned for tablet use in the field

---

## 7. Cross-Service Event Flow

Services communicate asynchronously through Kafka so that no single service is ever blocked waiting on another. Notification delivery, audit logging, and analytics aggregation are implemented as consumers layered across the relevant backend members' services rather than as a single point of failure.

| Kafka Topic | Producer | Consumers | Purpose |
|---|---|---|---|
| user-events | Auth Service (M1) | Notification pipeline (M8 logic), Audit Log | Registration, login, password-reset events |
| inventory-events | Equipment Service (M3) | Notification pipeline, Analytics feed | Low-stock and warranty-expiry alerts |
| maintenance-events | Maintenance Service (M4) | Technician Service (M5), Notification pipeline | Task assigned, task overdue/escalated |
| order-events | Order Service (M6) | Supplier Service (M7), Analytics feed | Order placed, order approved |
| shipment-events | Supplier Service (M7) | Notification pipeline, Hospital Dashboard UI (M9) | Order shipped, delivered, delayed |

---

## 8. Delivery Timeline & Build Order

*Build Order Dependency: Member 1 (Auth) unblocks everyone → Members 2 & 3 (Hospital, Equipment) unblock the domain services → Members 4-7 (Maintenance, Technician, Order, Supplier) build in parallel → Members 8-10 (Frontend) build against contracts from day one using mocked APIs, then integrate.*

| Phase | Owner(s) | Focus |
|---|---|---|
| Sprint 1 (Weeks 1-2) | Member 1 | Auth & Security Service — foundation for every other service |
| Sprint 2 (Weeks 2-3) | Members 2, 3 | Hospital and Equipment services — core domain data |
| Sprint 3 (Weeks 3-5) | Members 4, 5, 6, 7 | Maintenance, Technician, Order, and Supplier services |
| Sprint 4 (Weeks 4-6, parallel) | Members 8, 9, 10 | Frontend build-out against mocked/staging APIs |
| Sprint 5 (Week 6) | All members | Integration testing, Kafka event wiring, Gateway/Eureka registration |
| Sprint 6 (Week 7) | All members | Dockerization, CI/CD pipeline, monitoring dashboards, UAT, demo |

---

## 9. Definition of Done — Quality Standard

Every member's service is considered complete only when all of the following are true. This is the same bar used for production readiness reviews on real engineering teams.

- All REST endpoints documented in Swagger/OpenAPI and manually verified in the Swagger UI.
- Unit test coverage ≥ 80% (JUnit5/Mockito for backend, Jest/RTL for frontend).
- At least one integration test using Testcontainers (backend) or Cypress (frontend critical path).
- Service registers successfully with Eureka and responds on its Actuator health endpoint.
- Dockerfile builds cleanly and the service runs via docker-compose alongside its dependencies.
- All role-restricted endpoints verified against unauthorized and cross-role access attempts.
- Structured logging in place with correlation IDs for cross-service tracing.
- Code reviewed and merged via pull request with a passing CI pipeline (GitHub Actions).
- No High/Critical findings from SonarQube static analysis on the service.

---

*MedTrack Enterprise Case Study 06 • Microservice Assignment Charter • Engineering Group of 10*
