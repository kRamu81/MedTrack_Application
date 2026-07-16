import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GuidelinesPage from "./pages/GuidelinesPage";
import HelpPage from "./pages/HelpPage";
import AwardsPage from "./pages/AwardsPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";
import { ThemeProvider } from "./context/ThemeContext";

const getRouteStateFromPath = () => {
  const pathname = window.location.pathname;
  const path = pathname
    .replace(/^\/MedTrack_Application/i, "")
    .replace(/^\/+|\/+$/g, "");

  if (!path) return { page: "landing", data: null };

  if (path.startsWith("blog/")) {
    return {
      page: "blog-post",
      data: decodeURIComponent(path.slice("blog/".length)),
    };
  }

  if (path.startsWith("edit-equipment/")) {
    return {
      page: "edit-equipment",
      data: decodeURIComponent(path.slice("edit-equipment/".length)),
    };
  }

  if (path.startsWith("apply/")) {
    return {
      page: "apply",
      data: decodeURIComponent(path.slice("apply/".length)),
    };
  }

  const routeMap = {
    blog: "blog",
    register: "register",
    login: "login",
    "forgot-password": "forgot-password",
    "verify-otp": "verify-otp",
    "reset-password": "reset-password",
    dashboard: "dashboard",
    equipment: "equipment",
    "add-equipment": "add-equipment",
    "edit-equipment": "edit-equipment",
    "schedule-maintenance": "schedule-maintenance",
    "request-equipment": "request-equipment",
    maintenance: "maintenance",
    tasks: "tasks",
    "update-task": "update-task",
    updatetask: "update-task",
    orders: "orders",
    orderstatus: "orderstatus",
    about: "about",
    contact: "contact",
    guidelines: "guidelines",
    help: "help",
    awards: "awards",
    terms: "terms",
    security: "security",
  };

  return {
    page: routeMap[path.toLowerCase()] || "landing",
    data: null,
  };
};

function AppContent() {
  const initialRoute = getRouteStateFromPath();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [pageData, setPageData] = useState(initialRoute.data);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);

    const basePath = window.location.pathname.includes("/MedTrack_Application")
      ? "/MedTrack_Application"
      : "";

    const nextPath =
      page === "blog-post" && data
        ? `${basePath}/blog/${encodeURIComponent(data)}`
        : page === "edit-equipment" && data
        ? `${basePath}/edit-equipment/${encodeURIComponent(data)}`
        : page === "apply" && data
        ? `${basePath}/apply/${encodeURIComponent(data)}`
        : `${basePath}/${page}`;

    window.history.pushState({}, "", nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteStateFromPath();
      setCurrentPage(route.page);
      setPageData(route.data);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const noLayoutPages = [
    "login",
    "register",
    "forgot-password",
    "verify-otp",
    "reset-password",
    "apply"
  ];
  const isAuthPage = noLayoutPages.includes(currentPage);

  return (
    <ReactLenis root>
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
          ) : currentPage === "guidelines" ? (
            <GuidelinesPage />
          ) : currentPage === "help" ? (
            <HelpPage />
          ) : currentPage === "awards" ? (
            <AwardsPage />
          ) : currentPage === "terms" ? (
            <TermsPage />
          ) : currentPage === "security" ? (
            <SecurityPage />
          ) : (
            <AppRoutes
              currentPage={currentPage}
              onNavigate={handleNavigate}
              pageData={pageData}
            />
          )}
        </main>

        {!isAuthPage && <Footer onNavigate={handleNavigate} />}
      </div>
    </ReactLenis>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
