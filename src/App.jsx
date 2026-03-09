import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");

  const handleNavigate = (page) => setCurrentPage(page);

  const noLayoutPages = ["login", "register"];
  const isAuthPage = noLayoutPages.includes(currentPage);

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {!isAuthPage && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}
      <main className="flex-1">
        <AppRoutes currentPage={currentPage} onNavigate={handleNavigate} />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
