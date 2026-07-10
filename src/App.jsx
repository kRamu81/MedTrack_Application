import { useState, useEffect } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import { ThemeProvider } from "./context/ThemeContext";

// Parse page from pathname for manual URL entry and refreshes
const getPageFromPath = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith("/register")) return "register";
  if (path.endsWith("/login")) return "login";
  if (path.endsWith("/forgot-password")) return "forgot-password";
  if (path.endsWith("/verify-otp")) return "verify-otp";
  if (path.endsWith("/reset-password")) return "reset-password";
  if (path.endsWith("/dashboard")) return "dashboard";
  if (path.endsWith("/equipment")) return "equipment";
  if (path.endsWith("/add-equipment")) return "add-equipment";
  if (path.endsWith("/schedule-maintenance")) return "schedule-maintenance";
  if (path.endsWith("/request-equipment")) return "request-equipment";
  if (path.endsWith("/maintenance")) return "maintenance";
  if (path.endsWith("/tasks")) return "tasks";
  if (path.endsWith("/update-task") || path.endsWith("/updatetask")) return "update-task";
  if (path.endsWith("/orders")) return "orders";
  if (path.endsWith("/orderstatus")) return "orderstatus";
  return "landing";
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState(getPageFromPath());
  const [pageData, setPageData] = useState(null);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
    
    // Synchronize URL with the page
    const basePath = window.location.pathname.includes("/MedTrack_Application") 
      ? "/MedTrack_Application" 
      : "";
    window.history.pushState({}, "", `${basePath}/${page}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromPath());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const noLayoutPages = ["login", "register", "forgot-password", "verify-otp", "reset-password"];
  const isAuthPage = noLayoutPages.includes(currentPage);

  return (
    <div
      className="flex flex-col min-h-screen bg-surface text-primary transition-colors duration-200"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {!isAuthPage && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      <main className="flex-1">
        {currentPage === "about" ? (
          <AboutPage />
        ) : currentPage === "contact" ? (
          <ContactPage />
        ) : (
          <AppRoutes 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            pageData={pageData} 
          />
        )}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}


export default function App() {
  return (
    <ReactLenis root>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ReactLenis>
  );
}