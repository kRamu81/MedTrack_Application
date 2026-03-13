# 🏥 MedTrack — Medical Equipment Management & Tracking System

MedTrack is a **Microservices-based Medical Equipment Management Platform** that helps hospitals manage their **equipment inventory, maintenance schedules, and equipment orders** efficiently.

The system supports **three major roles**:

* 🏥 Hospital
* 🔧 Technician
* 🚚 Supplier

Each role interacts with the system through **secure authentication and role-based dashboards**.

---

# 🚀 Project Overview

MedTrack enables hospitals to manage the **complete lifecycle of medical equipment**, including:

* Equipment inventory management
* Maintenance scheduling
* Technician maintenance operations
* Equipment ordering
* Supplier order fulfillment

The system follows a **microservices architecture**, where each service handles a specific responsibility.

---

# 🌐 Live Project

Frontend: *(Add deployed frontend link here)*
Backend API: *(Add backend deployment link here)*

Example:

Frontend → https://kramu81.github.io/MedTrack_Application/


Backend → https://medtrack-api.onrender.com

---

# ❗ Problem Statement

Hospitals often struggle with managing medical equipment due to:

* Lack of centralized tracking systems
* Delayed maintenance schedules
* Poor visibility of equipment inventory
* Inefficient communication between technicians and suppliers

These issues can lead to **equipment downtime, delayed maintenance, and operational inefficiencies**.

---

# 💡 Solution

MedTrack provides a **centralized digital platform** that allows hospitals to:

* Track all equipment inventory
* Schedule maintenance tasks
* Assign technicians for servicing
* Order equipment from suppliers
* Track order delivery status

This improves **operational efficiency, transparency, and equipment reliability**.

---

# 👨‍💻 Team Structure (Microservice Assignment)

The project is divided into **10 microservices / modules**, where each team member is responsible for at least one service.

| Member    | Microservice                | Responsibility                         |
| --------- | --------------------------- | -------------------------------------- |
| Member 1  | 🔐 Authentication Service   | User registration, login, JWT security |
| Member 2  | 🏥 Hospital Service         | Hospital profile management            |
| Member 3  | 🩺 Equipment Service        | Equipment inventory management         |
| Member 4  | 🗓 Maintenance Service      | Maintenance scheduling                 |
| Member 5  | 🔧 Technician Service       | Technician operations                  |
| Member 6  | 📦 Equipment Order Service  | Order placement                        |
| Member 7  | 🚚 Supplier Service         | Order processing                       |
| Member 8  | 🖥 Frontend Auth            | Login and registration UI              |
| Member 9  | 📋 Hospital Dashboard       | Hospital dashboard pages               |
| Member 10 | 📱 Technician & Supplier UI | Technician & supplier dashboards       |

---

# ⚙️ Technology Stack

## Frontend

* React.js
* Tailwind CSS
* Axios
* React Router

## Backend

* Spring Boot
* Spring Security
* JWT Authentication
* REST APIs

## Database

* MySQL

## Tools

* Git & GitHub
* Postman
* VS Code
* Maven

---

# 🏗️ System Architecture

```
React Frontend
      ↓
Spring Boot Backend
      ↓
Microservices
   ├── Authentication Service
   ├── Hospital Service
   ├── Equipment Service
   ├── Maintenance Service
   ├── Technician Service
   ├── Order Service
   └── Supplier Service
      ↓
      MySQL Database
```

---

# 📂 Frontend Project Structure

```
src
│
├── assets
│   ├── image1.jpg
│   └── logo.png
│
├── components
│   ├── auth
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   │
│   ├── common
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── Loader.jsx
│
├── context
│   └── AuthContext.jsx
│
├── pages
│   ├── auth
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   │
│   ├── hospital
│   │   ├── Dashboard.jsx
│   │   ├── AddEquipmentForm.jsx
│   │   ├── EquipmentList.jsx
│   │   ├── MaintenanceSchedule.jsx
│   │   ├── RequestEquipmentPage.jsx
│   │   └── ScheduleMaintenancePage.jsx
│   │
│   ├── technician
│   ├── supplier
│   │
│   ├── LandingPage.jsx
│   ├── AboutPage.jsx
│   └── ContactPage.jsx
│
├── routes
│   └── AppRoutes.jsx
│
├── App.jsx
└── index.js
```

---

# 🔐 Authentication Flow

1. User registers with a role:

   * HOSPITAL
   * TECHNICIAN
   * SUPPLIER

2. User logs in and receives a **JWT token**.

3. Token is stored in **localStorage**.

4. Axios attaches the token to every API request.

5. Spring Security validates the token and authorizes access.

---

# 📊 Core Features

## Hospital

* Create hospital profile
* Add equipment
* View equipment inventory
* Schedule maintenance
* Request equipment orders

## Technician

* View maintenance tasks
* Update maintenance status
* Mark tasks as completed

## Supplier

* View equipment orders
* Update order status
* Process equipment delivery

---

# 🔄 Equipment Order Workflow

```
PENDING → SHIPPED → DELIVERED
```

---

# 🔧 Maintenance Workflow

```
PENDING → IN_PROGRESS → COMPLETED
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/your-username/medtrack.git
```

Navigate to project directory:

```bash
cd medtrack
```

Install dependencies:

```bash
npm install
```

Run the project:

```bash
npm start
```

---

# 🔄 Pull Latest Changes

Before starting work, always pull the latest code:

```bash
git pull origin main
```

---

# 📤 Push Changes

```bash
git add .
git commit -m "Added new feature"
git push origin main
```

---

# 📌 Recommended Development Order

1. Authentication Service
2. Hospital Service
3. Equipment Service
4. Maintenance Service
5. Technician Service
6. Equipment Order Service
7. Supplier Service
8. Frontend Authentication
9. Hospital Dashboard UI
10. Technician & Supplier Dashboard UI

---

# 📄 License

This project was developed as part of the **MedTrack Case Study 06 — Microservice Assignment**.
