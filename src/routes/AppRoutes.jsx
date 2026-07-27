// src/routes/AppRoutes.jsx
import React, { Suspense } from "react";
import { useAuth } from "../context/AuthContext";

// Page Imports
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import CareersPage from "../pages/CareersPage";
import JobApplicationPage from "../pages/JobApplicationPage";
import CertificateGeneratorPage from "../pages/CertificateGeneratorPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import Dashboard from "../pages/hospital/Dashboard";
import AnalyticsDashboard from "../pages/hospital/AnalyticsDashboard";
import EquipmentList from "../pages/hospital/EquipmentList";
import MaintenanceSchedule from "../pages/hospital/MaintenanceSchedule";
import TaskList from "../pages/technician/TaskList";
import UpdateTask from "../pages/technician/UpdateTask";
import OrdersList from "../pages/supplier/OrdersList";
import OrderStatus from "../pages/supplier/OrderStatus";
import AuthoritySecurityPage from "../pages/auth/AuthoritySecurityPage";
import MfaSecurityPage from "../pages/auth/MfaSecurityPage";
import EnterpriseSsoPage from "../pages/auth/EnterpriseSsoPage";
import RbacSecurityPage from "../pages/auth/RbacSecurityPage";
import ZeroTrustSecurityPage from "../pages/auth/ZeroTrustSecurityPage";
import ComplianceSecurityPage from "../pages/auth/ComplianceSecurityPage";
import ThreatDetectionSoarPage from "../pages/auth/ThreatDetectionSoarPage";
import SecurityKeyVaultPage from "../pages/auth/SecurityKeyVaultPage";
import DlpPrivacyGuardPage from "../pages/auth/DlpPrivacyGuardPage";
import PasskeyPasswordlessPage from "../pages/auth/PasskeyPasswordlessPage";
import ZeroTrustNetworkPage from "../pages/auth/ZeroTrustNetworkPage";
import ScimProvisioningPage from "../pages/auth/ScimProvisioningPage";
import SiemSecurityAnalyticsPage from "../pages/auth/SiemSecurityAnalyticsPage";
import SecurityPosturePage from "../pages/auth/SecurityPosturePage";

// --- Connected Imports ---
import AddEquipmentForm from "../pages/hospital/AddEquipmentForm";
import EditEquipmentForm from "../pages/hospital/EditEquipmentForm";
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

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
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

  let page;
  switch (currentPage) {
    case "landing":
      page = <LandingPage onNavigate={onNavigate} />;
      break;
    case "blog":
      page = <Blog onNavigate={onNavigate} />;
      break;
    case "blog-post":
      page = <BlogPost onNavigate={onNavigate} slug={pageData} />;
      break;
    case "careers":
      page = <CareersPage onNavigate={onNavigate} />;
      break;
    case "apply":
      page = <JobApplicationPage onNavigate={onNavigate} jobId={pageData} />;
      break;
    case "certificate":
      page = <CertificateGeneratorPage />;
      break;
    case "login":
      page = <LoginPage onNavigate={onNavigate} />;
      break;
    case "register":
      page = <RegisterPage onNavigate={onNavigate} defaultRole={pageData} />;
      break;
    case "forgot-password":
      page = <ForgotPasswordPage onNavigate={onNavigate} />;
      break;
    case "verify-otp":
      page = <VerifyOtpPage onNavigate={onNavigate} />;
      break;
    case "reset-password":
      page = <ResetPasswordPage onNavigate={onNavigate} />;
      break;
    case "dashboard":
      page = ProtectedRoute(Dashboard);
      break;
    case "equipment":
      page = ProtectedRoute(EquipmentList);
      break;
    case "add-equipment":
      page = ProtectedRoute(AddEquipmentForm, {}, ["hospital"]);
      break;
    case "edit-equipment":
      page = ProtectedRoute(EditEquipmentForm, { equipmentId: pageData }, ["hospital"]);
      break;
    case "schedule-maintenance":
      page = ProtectedRoute(ScheduleMaintenancePage, {}, ["hospital"]);
      break;
    case "request-equipment":
      page = ProtectedRoute(RequestEquipmentPage, {}, ["hospital"]);
      break;
    case "maintenance":
      page = ProtectedRoute(MaintenanceSchedule);
      break;
    case "analytics":
      page = ProtectedRoute(AnalyticsDashboard, {}, ["hospital"]);
      break;
    case "tasks":
      page = ProtectedRoute(TaskList);
      break;
    case "update-task":
    case "updatetask":
      page = ProtectedRoute(UpdateTask, { task: pageData });
      break;
    case "orders":
      page = ProtectedRoute(OrdersList);
      break;
    case "orderstatus":
      page = ProtectedRoute(OrderStatus, { order: pageData });
      break;
    case "authority-security":
    case "authority":
      page = ProtectedRoute(AuthoritySecurityPage, {}, ["hospital"]);
      break;
    case "mfa-security":
    case "mfa":
      page = ProtectedRoute(MfaSecurityPage);
      break;
    case "sso-security":
    case "sso":
      page = ProtectedRoute(EnterpriseSsoPage, {}, ["hospital"]);
      break;
    case "rbac-security":
    case "rbac":
      page = ProtectedRoute(RbacSecurityPage);
      break;
    case "zerotrust-security":
    case "zerotrust":
      page = ProtectedRoute(ZeroTrustSecurityPage);
      break;
    case "compliance-security":
    case "compliance":
      page = ProtectedRoute(ComplianceSecurityPage);
      break;
    case "threat-detection":
    case "soar-security":
    case "soar":
      page = ProtectedRoute(ThreatDetectionSoarPage);
      break;
    case "keyvault-security":
    case "keyvault":
      page = ProtectedRoute(SecurityKeyVaultPage);
      break;
    case "dlp":
    case "dlp-privacy":
    case "privacy-guard":
      page = ProtectedRoute(DlpPrivacyGuardPage);
      break;
    case "passkeys":
    case "passwordless":
    case "webauthn":
      page = ProtectedRoute(PasskeyPasswordlessPage);
      break;
    case "ztna":
    case "microsegmentation":
    case "network-access":
      page = ProtectedRoute(ZeroTrustNetworkPage);
      break;
    case "siem":
    case "siem-analytics":
    case "siem-security":
      return ProtectedRoute(SiemSecurityAnalyticsPage);
    case "scim-provisioning":
    case "scim":
      return ProtectedRoute(ScimProvisioningPage);

    // --- Fallback: 404 ---
    default:
      return <NotFoundPage onNavigate={onNavigate} />;
  }

  return <Suspense fallback={<LoadingFallback />}>{page}</Suspense>;
}
