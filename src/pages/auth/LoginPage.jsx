import { useState } from "react";
import { ArrowLeft, ChevronDown, Hospital, Layers, Lock, Mail, Wrench } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/AuthService";
import MedTrackLogo from "../../components/common/MedTrackLogo";
import "./auth.css";

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

      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        organization: response.user.organization,
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

  const handleRoleChange = (roleKey) => {
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

  const RoleIcon = selectedRole === "technician" ? Wrench : selectedRole === "supplier" ? Layers : Hospital;

  return (
    <main className="split-auth-container">
      <section className="split-form-section" style={{ position: 'relative' }}>
        <button 
          onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'} 
          style={{ position: 'absolute', top: '40px', left: '40px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="auth-title">
          <h1>Welcome back!</h1>
          <p>Simplify your workflow and boost your productivity with MedTrack. Get started for free.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <div className="input-box">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <div className="input-box">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <div className="input-box">
              <RoleIcon size={18} />
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="auth-select"
                required
              >
                <option value="hospital">Hospital Workspace</option>
                <option value="technician">Technician Workspace</option>
                <option value="supplier">Supplier Workspace</option>
              </select>
              <ChevronDown size={18} className="select-chevron" />
            </div>
          </label>

          <div className="form-row" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="link-button"
              style={{ color: '#64748b', fontWeight: 500 }}
              onClick={() => onNavigate && onNavigate("forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider-row">
          <span>or continue with</span>
        </div>

        <div className="social-login-group">
          <button type="button" className="social-circle-btn" aria-label="Google">
            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/></svg>
          </button>
          <button type="button" className="social-circle-btn" aria-label="Apple">
            <svg viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" fill="#ffffff"/></svg>
          </button>
          <button type="button" className="social-circle-btn" aria-label="Facebook">
            <svg viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" fill="#ffffff"/></svg>
          </button>
        </div>

        <footer className="auth-footer" style={{ marginTop: "24px" }}>
          <span>Not a member?</span>
          <a
            href="/register"
            className="split-footer-link"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate("register");
              }
            }}
          >
            Register now
          </a>
        </footer>
      </section>

      <section className="split-image-section">
        <img src="/auth_illustration.jpg" alt="Illustration" style={{ mixBlendMode: 'multiply', borderRadius: '16px' }} />
        <div className="carousel-indicators">
          <div className="carousel-dot active"></div>
          <div className="carousel-dot"></div>
          <div className="carousel-dot"></div>
        </div>
        <h2>Make your work easier and organized with <span>MedTrack</span></h2>
      </section>
    </main>
  );
}