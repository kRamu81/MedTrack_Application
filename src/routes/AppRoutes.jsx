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

export default function AppRoutes({ currentPage, onNavigate }) {
  const { user } = useAuth();

  switch (currentPage) {
    case "landing": return <LandingPage onNavigate={onNavigate} />;
    case "login": return <LoginPage onNavigate={onNavigate} />;
    case "register": return <RegisterPage onNavigate={onNavigate} />;
    case "dashboard": return user ? <Dashboard onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "equipment": return user ? <EquipmentList /> : <LoginPage onNavigate={onNavigate} />;
    case "maintenance": return user ? <MaintenanceSchedule /> : <LoginPage onNavigate={onNavigate} />;
    case "tasks": return user ? <TaskList onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "updatetask": return user ? <UpdateTask onNavigate={onNavigate} /> : <LoginPage onNavigate={onNavigate} />;
    case "orders": return user ? <OrdersList /> : <LoginPage onNavigate={onNavigate} />;
    case "orderstatus": return user ? <OrderStatus /> : <LoginPage onNavigate={onNavigate} />;
    default: return <LandingPage onNavigate={onNavigate} />;
  }
}
