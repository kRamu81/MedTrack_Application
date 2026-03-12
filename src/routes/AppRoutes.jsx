import { useAuth } from "../context/AuthContext";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Dashboard from "../pages/hospital/Dashboard";
import EquipmentList from "../pages/hospital/EquipmentList";
import MaintenanceSchedule from "../pages/hospital/MaintenanceSchedule";
import TaskList from "../pages/technician/TaskList";
import UpdateTask from "../pages/technician/UpdateTask";
import OrdersList from "../pages/supplier/OrdersList";
import OrderStatus from "../pages/supplier/OrderStatus";

// --- NEW IMPORTS ---
import AddEquipmentForm from "../pages/hospital/AddEquipmentForm";
import ScheduleMaintenancePage from "../pages/hospital/ScheduleMaintenancePage";
import RequestEquipmentPage from "../pages/hospital/RequestEquipmentPage";

export default function AppRoutes({ currentPage, onNavigate }) {
  const { user } = useAuth();

  switch (currentPage) {
    // Public Routes
    case "landing": return <LandingPage onNavigate={onNavigate} />;
    case "login": return <LoginPage onNavigate={onNavigate} />;
    case "register": return <RegisterPage onNavigate={onNavigate} />;
    
    // Protected Routes - Hospital
    case "dashboard": return user ? <Dashboard onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "equipment": return user ? <EquipmentList onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "add-equipment": return user ? <AddEquipmentForm onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "schedule-maintenance": return user ? <ScheduleMaintenancePage onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "request-equipment": return user ? <RequestEquipmentPage onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "maintenance": return user ? <MaintenanceSchedule onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    
    // Protected Routes - Technician
    case "tasks": return user ? <TaskList onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "updatetask": return user ? <UpdateTask onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    
    // Protected Routes - Supplier
    case "orders": return user ? <OrdersList onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "orderstatus": return user ? <OrderStatus onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    
    // Fallback
    default: return <LandingPage onNavigate={onNavigate} />;
  }
}
