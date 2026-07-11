// src/routes/AppRoutes.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

// Page Imports
import LandingPage from "../pages/LandingPage";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
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

const UnauthorizedPage = ({ onNavigate, message }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white p-6">
    <div className="bg-slate-800 rounded-[2rem] p-16 text-center border border-red-500/20 max-w-md shadow-2xl">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">
        ⚠️
      </div>
      <h2 className="text-2xl font-black mb-2">Access Denied</h2>
      <p className="text-red-400 font-bold mb-6">
        {message ||
          "Your account role is not authorized to access this resource."}
      </p>
      <button
        onClick={() => onNavigate("dashboard")}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

export default function AppRouter({ currentPage, onNavigate, pageData }) {
  const { user } = useAuth();

  const ProtectedRoute = (Component, props = {}, allowedRoles = []) => {
    if (!user) return <LoginPage onNavigate={onNavigate} />;

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role?.toLowerCase())
    ) {
      return <UnauthorizedPage onNavigate={onNavigate} />;
    }

    return <Component onNavigate={onNavigate} {...props} />;
  };

  switch (currentPage) {
    // --- Public Routes ---
    case "landing":
      return <LandingPage onNavigate={onNavigate} />;
    case "blog":
      return <Blog onNavigate={onNavigate} />;
    case "blog-post":
      return <BlogPost onNavigate={onNavigate} slug={pageData} />;
    case "login":
      return <LoginPage onNavigate={onNavigate} />;
    case "register":
      return <RegisterPage onNavigate={onNavigate} />;
    case "forgot-password":
      return <ForgotPasswordPage onNavigate={onNavigate} />;
    case "verify-otp":
      return <VerifyOtpPage onNavigate={onNavigate} />;
    case "reset-password":
      return <ResetPasswordPage onNavigate={onNavigate} />;

    // --- Protected Routes: Hospital Admin ---
    case "dashboard":
      return ProtectedRoute(Dashboard);
    case "equipment":
      return ProtectedRoute(EquipmentList);
    case "add-equipment":
      return ProtectedRoute(AddEquipmentForm, {}, ["hospital"]);
    case "schedule-maintenance":
      return ProtectedRoute(ScheduleMaintenancePage, {}, ["hospital"]);
    case "request-equipment":
      return ProtectedRoute(RequestEquipmentPage, {}, ["hospital"]);
    case "maintenance":
      return ProtectedRoute(MaintenanceSchedule);

    // --- Protected Routes: Technician ---
    case "tasks":
      return ProtectedRoute(TaskList);
    case "update-task":
      return ProtectedRoute(UpdateTask, { task: pageData });
    case "updatetask":
      return ProtectedRoute(UpdateTask, { task: pageData });

    // --- Protected Routes: Supplier ---
    case "orders":
      return ProtectedRoute(OrdersList);
    case "orderstatus":
      return ProtectedRoute(OrderStatus, { order: pageData });

    // --- Fallback ---
    default:
      return <LandingPage onNavigate={onNavigate} />;
  }
}
