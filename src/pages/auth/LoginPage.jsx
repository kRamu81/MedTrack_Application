import { useState } from "react";
import { Check, Hospital, Layers, Lock, Mail, Wrench } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/AuthService";
import "./auth.css";

const roles = [
  {
    title: "Hospital",
    subtitle: "Manage Equipment",
    icon: Hospital,
    roleKey: "hospital",
  },
  {
    title: "Technician",
    subtitle: "Maintenance",
    icon: Wrench,
    roleKey: "technician",
  },
  {
    title: "Supplier",
    subtitle: "Medical Equipment Vendor",
    icon: Layers,
    roleKey: "supplier",
  },
];

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("hospital");
  const [email, setEmail] = useState("admin@medtrack.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginUser({ email, password, role: selectedRole.toUpperCase() });

      // Flatten the nested response shape into the format AuthContext expects
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        organization: response.user.organization,
        // Store role as lowercase so AppRoutes page-key mapping works correctly
        role: response.user.role.toLowerCase(),
        token: response.token,
      };

      login(userData);

      if (onNavigate) {
        onNavigate(
          userData.role === "hospital" ? "dashboard"
            : userData.role === "technician" ? "tasks"
            : "orders"
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        setError(err.response.data.message || "Invalid credentials.");
      } else {
        setError("Server not responding. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === "hospital") {
      setEmail("admin@medtrack.com");
      setPassword("admin123");
    } else if (roleKey === "technician") {
      setEmail("tech@medtrack.com");
      setPassword("tech123");
    } else if (roleKey === "supplier") {
      setEmail("supplier@medtrack.com");
      setPassword("supplier123");
    }
  };

  return (
    <main className="auth-page auth-page-with-bg">
      <div className="auth-bg" aria-hidden="true" style={{ backgroundImage: 'url("/medtrack-auth-bg.png")' }} />
      <section className="auth-card">
        <header className="auth-header">
          <img src="/medtrack-logo.png" alt="MedTrack" className="auth-logo" />
          <span className="platform-badge">Healthcare Equipment Platform</span>
        </header>

        <div className="auth-title">
          <h1>
            Sign into
            <br />
            Your <span>Workspace</span>
          </h1>
        </div>

        <div className="role-section">
          <p className="section-label">Select Professional Role</p>

          <div className="role-grid">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.roleKey;

              return (
                <button
                  key={role.title}
                  type="button"
                  onClick={() => handleRoleSelect(role.roleKey)}
                  className={isSelected ? "role-card selected" : "role-card"}
                >
                  <span className="role-icon">
                    <Icon size={18} />
                  </span>

                  {isSelected && (
                    <span className="role-check">
                      <Check size={12} />
                    </span>
                  )}

                  <span className="role-title">{role.title}</span>
                  <span className="role-subtitle">{role.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Hospital Email
            <div className="input-box">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-box">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <div className="form-row">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              Remember Me
            </label>

            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate && onNavigate("forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In to Workspace"}
          </button>
        </form>

        <div className="divider-row">
          <span>OR</span>
        </div>

        <button type="button" className="google-button">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <footer className="auth-footer">
          <span>Don’t have an account?</span>
          <a
            href="/register"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate("register");
              }
            }}
          >
            Register Node
          </a>
        </footer>
      </section>
    </main>
  );
}