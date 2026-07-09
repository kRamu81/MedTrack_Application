import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Landing page links
  const publicLinks = [
    { label: "Home", page: "landing" },
    { label: "Product", page: "product" },
    { label: "About", page: "about" },
    { label: "Partners", page: "partners" },
    { label: "Blog", page: "blog" },
    { label: "Contact", page: "contact" },
  ];

  // Dashboard links after login
  const privateLinks = user
    ? user.role === "hospital"
      ? [
          { label: "Dashboard", page: "dashboard" },
          { label: "Equipment", page: "equipment" },
          { label: "Maintenance", page: "maintenance" },
        ]
      : user.role === "technician"
      ? [
          { label: "My Tasks", page: "tasks" },
          { label: "Update Task", page: "updatetask" },
        ]
      : [
          { label: "Orders", page: "orders" },
          { label: "Order Status", page: "orderstatus" },
        ]
    : [];

  const navLinks = user ? privateLinks : publicLinks;

  return (
    <nav className="bg-surface/80 backdrop-blur-lg border-b border-subtle sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center group transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="bg-card p-1.5 rounded-lg shadow-sm">
              <img src={logo} alt="MedTrack Logo" className="h-8 w-auto object-contain" />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">

            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.page
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-secondary hover:text-primary hover:bg-hover"
                }`}
              >
                {link.label}
              </button>
            ))}

          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-4">

            {/* Dark Mode Toggle — unconditional, visible logged in or out */}
            <button
              onClick={toggleTheme}
              className="p-2 text-secondary hover:text-primary rounded-full hover:bg-hover transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {user ? (
              <>
                {/* User Avatar */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>

                  <span className="text-sm text-primary font-medium">
                    {user.name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="text-sm text-secondary hover:text-primary"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <button
                  onClick={() => onNavigate("login")}
                  className="text-sm text-secondary hover:text-primary"
                >
                  Log in
                </button>

                {/* Get Started */}
                <button
                  onClick={() => onNavigate("register")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary hover:bg-hover"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-subtle bg-surface px-6 py-4 space-y-3">

          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => {
                onNavigate(link.page);
                setMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                currentPage === link.page
                  ? "bg-blue-600 text-white"
                  : "text-primary hover:bg-hover"
              }`}
            >
              {link.label}
            </button>
          ))}

        </div>
      )}
    </nav>
  );
}