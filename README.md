# 🏥 MedTrack — Medical Equipment Management & Tracking System

MedTrack is a **Full-Stack Medical Equipment Management Platform** that helps hospitals manage their **equipment inventory, maintenance schedules, and equipment orders** efficiently.

The system supports **three major roles**:
* 🏥 **Hospital**: Manage inventory, schedule maintenance, and order equipment.
* 🔧 **Technician**: View and complete assigned maintenance tasks.
* 🚚 **Supplier**: Fulfill equipment orders and update delivery status.

---

## 🚀 Recent Updates
- ✅ **Full-Stack Integration**: Frontend (Port 3000) is now fully connected to the Backend (Port 8081).
- ✅ **Fixed Registration**: Resolved critical backend compilation errors and "404 Not Found" API issues.
- ✅ **SPA Routing**: Fixed Single Page Application routing for Spring Boot 3.

---

## ⚙️ Technology Stack

### Frontend
- **React.js** with **Tailwind CSS**
- **Axios** (Configured for Port 8081)
- **Context API** for Authentication

### Backend
- **Spring Boot 3.2.4**
- **Spring Data JPA** & **Spring Security**
- **H2 In-Memory Database** (Perfect for development)
- **Maven** for build management

---

## 🏗️ Project Structure

```
MedTrack_Application/
├── src/                      # React Frontend
│   ├── components/           # Reusable UI components
│   ├── pages/                # Role-based dashboards & Auth pages
│   └── services/             # API communication (HttpService.js)
│
└── Backend/                  # Spring Boot Backend
    ├── src/main/java/com/medtrack/
    │   ├── config/           # Security & Data Seeding
    │   ├── controller/       # REST API Endpoints
    │   ├── model/            # JPA Entities
    │   ├── service/          # Business Logic
    │   └── repository/       # Database Access
    └── pom.xml               # Dependencies
```

---

## 🚥 Getting Started

### 1. Start the Backend (Java 17+)
Navigate to the Backend directory and run using Maven:
```bash
cd Backend
mvn spring-boot:run
```
- **API URL**: `http://localhost:8081`
- **H2 Console**: `http://localhost:8081/h2-console` (JDBC: `jdbc:h2:mem:medtrackdb`, User: `sa`)

### 2. Start the Frontend (Node.js)
Navigate to the root directory and run:
```bash
npm install
npm start
```
- **App URL**: `http://localhost:3000/MedTrack_Application`

---

## 🔐 Default Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Hospital Admin | `hospital@medtrack.com` | `admin123` |
| Technician | `tech@medtrack.com` | `tech123` |
| Supplier | `supplier@medtrack.com` | `supply123` |

---

## 📊 Core Features
- **Hospital**: Add equipment, track inventory, and schedule maintenance tasks.
- **Technician**: Real-time maintenance task list with status updates.
- **Supplier**: Order tracking from `PENDING` to `DELIVERED`.

---

## 📄 License
This project was developed for the **MedTrack Case Study 06**.
