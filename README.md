<h1 align="center">MedTrack 🏥</h1>

<p align="center">
  <strong>A Full-Stack Medical Equipment Management & Tracking System</strong>
</p>

<p align="center">
  <a href="#what-is-this-really">About</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#usage--test-accounts">Usage</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="LICENSE">MIT License</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/images/logo.png" alt="MedTrack Logo" width="100">
</p>

<p align="center">
  <sub><em>Connecting Hospitals, Technicians, and Suppliers in one platform.</em></sub>
</p>

---

## What is this, really?

MedTrack is a **Full-Stack Medical Equipment Management Platform** that helps hospitals manage their equipment inventory, maintenance schedules, and equipment orders efficiently.

The system is designed with a microservice-oriented backend and a responsive React frontend, created specifically for the **MedTrack Case Study 06** during the Elite Summer of Code (ECSoc).

It supports three major roles:
* 🏥 **Hospital**: Manage inventory, schedule maintenance, and order equipment.
* 🔧 **Technician**: View and complete assigned maintenance tasks.
* 🚚 **Supplier**: Fulfill equipment orders and update delivery status.

---

## Stuff you do in MedTrack

- **Manage Equipment Inventory:** Hospitals can add, track, and update their entire fleet of medical devices.
- **Schedule Maintenance:** Automatically track when machines need servicing and assign them to specialized technicians.
- **Complete Work Orders:** Technicians have a dedicated portal to view their assigned tasks and mark them as resolved.
- **Order New Equipment:** Hospitals can browse catalogs and place orders directly with integrated suppliers.
- **Fulfill Deliveries:** Suppliers receive purchase orders, approve them, and manage the delivery lifecycle.

---

## A look inside

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>Built with modern tech</strong><br>
      A robust Java Spring Boot backend paired with a dynamic React.js frontend, styled beautifully with Tailwind CSS.
    </td>
    <td width="50%" valign="top">
      <strong>Role-based access</strong><br>
      Secure, partitioned dashboards for Hospitals, Technicians, and Suppliers—all living in the same unified system.
    </td>
  </tr>
</table>

---

## Why MedTrack is better

One platform. One source of truth. Hospitals no longer need to use separate spreadsheets for inventory, emails for maintenance, and phone calls for ordering. MedTrack unifies the entire lifecycle of medical equipment—from purchase to decommission—into a single, auditable workflow.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Java 17 or higher
* Node.js (v16+)
* npm (v8+)
* Maven

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/kRamu81/MedTrack_Application.git
   ```

2. **Start the Backend**
   ```sh
   cd Backend
   mvn spring-boot:run
   ```
   * **API URL**: `http://localhost:8081`
   * **H2 Console**: `http://localhost:8081/h2-console` (JDBC: `jdbc:h2:mem:medtrackdb`, User: `sa`)

3. **Start the Frontend**
   ```sh
   # Open a new terminal in the root directory
   npm install
   npm start
   ```
   * **App URL**: `http://localhost:3000`

---

## Usage & Test Accounts

Use the following default accounts to test the different role dashboards:

| Role | Email | Password |
|------|-------|----------|
| Hospital Admin | `hospital@medtrack.com` | `admin123` |
| Technician | `tech@medtrack.com` | `tech123` |
| Supplier | `supplier@medtrack.com` | `supply123` |

---

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for full details on how to get started, assign yourself an issue, and submit a Pull Request.

<a href="https://github.com/kRamu81/MedTrack_Application/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kRamu81/MedTrack_Application" alt="Contributors" />
</a>
