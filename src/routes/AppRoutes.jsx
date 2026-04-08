// src/routes/AppRoutes.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

// Page Imports
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

// --- Connected Imports ---
import AddEquipmentForm from "../pages/hospital/AddEquipmentForm";
import ScheduleMaintenancePage from "../pages/hospital/ScheduleMaintenancePage";
import RequestEquipmentPage from "../pages/hospital/RequestEquipmentPage";

export default function AppRouter({ currentPage, onNavigate, pageData }) {
  const { user } = useAuth();

  // Helper function to protect routes
  const ProtectedRoute = (Component, props = {}) => {
    return user ? (
      <Component onNavigate={onNavigate} {...props} />
    ) : (
      <LoginPage onNavigate={onNavigate} />
    );
  };

  switch (currentPage) {
    // --- Public Routes ---
    case "landing": 
      return <LandingPage onNavigate={onNavigate} />;
    case "login": 
      return <LoginPage onNavigate={onNavigate} />;
    case "register": 
      return <RegisterPage onNavigate={onNavigate} />;
    
    // --- Protected Routes: Hospital Admin ---
    case "dashboard": 
      return ProtectedRoute(Dashboard);
    case "equipment": 
      return ProtectedRoute(EquipmentList);
    case "add-equipment": 
      return ProtectedRoute(AddEquipmentForm);
    case "schedule-maintenance": 
      return ProtectedRoute(ScheduleMaintenancePage);
    case "request-equipment": 
      return ProtectedRoute(RequestEquipmentPage);
    case "maintenance": 
      return ProtectedRoute(MaintenanceSchedule);
    
    // --- Protected Routes: Technician ---
    case "tasks": 
      return ProtectedRoute(TaskList);
    case "update-task": 
      return ProtectedRoute(UpdateTask, { task: pageData });
    case "updatetask": // Fallback for case sensitivity
      return ProtectedRoute(UpdateTask, { task: pageData });
    
    // --- Protected Routes: Supplier ---
    case "orders": 
      return ProtectedRoute(OrdersList);
    case "orderstatus": 
      return ProtectedRoute(OrderStatus);
    
    // --- Fallback ---
    default: 
      return <LandingPage onNavigate={onNavigate} />;
  }
}