import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLanding = currentPage === "landing";

  // Landing page links
 const publicLinks = [
  { label: "Features", page: "features" },
  { label: "Hospitals", page: "hospitals" },
  { label: "Suppliers", page: "suppliers" },
  { label: "Blog", page: "blog" },
  { label: "For employers", page: "about" },
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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isLanding ? (scrolled ? 'top-0 bg-surface/95 backdrop-blur-md shadow-sm border-b border-subtle' : 'top-0 bg-transparent border-transparent') : 'sticky top-0 bg-surface/80 backdrop-blur-lg border-b border-subtle'}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg"
          >
            <span className="text-2xl font-black tracking-tighter text-blue-600">"medtrack"</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">

            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`text-sm font-bold transition-all ${
                  currentPage === link.page
                    ? "text-blue-600"
                    : "text-primary hover:text-blue-600"
                }`}
              >
                {link.label}
              </button>
            ))}

          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-6">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="text-primary hover:text-blue-600 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-primary font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onNavigate("landing");
                  }}
                  className="text-sm font-bold text-primary hover:text-blue-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("login")}
                className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in
              </button>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-primary hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
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
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${
                currentPage === link.page ? "bg-blue-600 text-white" : "text-primary hover:bg-hover"
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