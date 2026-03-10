import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
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
    <nav className="bg-white/30 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="logo" className="h-8 w-auto" />
            {/* <span className="font-semibold text-lg text-gray-900">
              Med<span className="text-blue-600">Track</span>
            </span> */}
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
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </button>
            ))}

          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-4">

            {user ? (
              <>
                {/* User Avatar */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>

                  <span className="text-sm text-gray-700 font-medium">
                    {user.name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <button
                  onClick={() => onNavigate("login")}
                  className="text-sm text-gray-600 hover:text-gray-900"
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
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">

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
                  : "text-gray-700 hover:bg-gray-100"
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