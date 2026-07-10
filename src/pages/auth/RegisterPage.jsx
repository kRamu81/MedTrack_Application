import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/AuthService";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Building2,
  Check,
  Hospital,
  Layers,
  Lock,
  Mail,
  Phone,
  User,
  Wrench,
  ArrowRight,
} from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(useGSAP);

const roles = [
  {
    title: "Hospital",
    subtitle: "Manage Equipment",
    icon: Hospital,
  },
  {
    title: "Technician",
    subtitle: "Maintenance",
    icon: Wrench,
  },
  {
    title: "Supplier",
    subtitle: "Medical Equipment Vendor",
    icon: Layers,
  },
];

export default function RegisterPage({ onNavigate }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Hospital");
  const [fullName, setFullName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  useGSAP(() => {
    // Hide components initially to prevent flash of unstyled content
    gsap.set(".auth-card", { opacity: 0, y: 40 });
    gsap.set(".auth-header, .auth-title, .role-section, .auth-form, .auth-footer", { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".auth-card", {
      opacity: 1,
      y: 0,
      duration: 0.8,
    })
    .to(".auth-header, .auth-title, .role-section, .auth-form, .auth-footer", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
    }, "-=0.4");
  }, { scope: containerRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser({
        name: fullName,
        organization: hospitalName,
        email: email,
        phone: phone,
        password: password,
        confirmPassword: confirmPassword,
        role: selectedRole.toUpperCase(),
      });
      login(user);
      onNavigate("login");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Registration failed.");
      } else {
        setError("Server not responding. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <main className="auth-page auth-page-with-bg" ref={containerRef}>
      <div className="auth-bg" style={{ backgroundImage: 'url("/medtrack-auth-bg.png")' }} aria-hidden="true" />
      <section className="auth-card">
        <header className="auth-header">
          <img src="/medtrack-logo.png" alt="MedTrack" className="auth-logo" />
          <span className="platform-badge">Healthcare Equipment Platform</span>
        </header>

        <div className="auth-title">
          <h1>
            Create Your
            <br />
            <span>Account</span>
          </h1>
        </div>

        <div className="role-section">
          <p className="section-label">Select Professional Role</p>

          <div className="role-grid">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.title;

              return (
                <button
                  key={role.title}
                  type="button"
                  className={isSelected ? "role-card selected" : "role-card"}
                  onClick={() => setSelectedRole(role.title)}
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

        {error && (
          <div
            className="error-message"
            style={{
              padding: "12px 16px",
              borderRadius: "14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "13px",
              marginBottom: "18px",
              fontWeight: "600"
            }}
          >
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="two-column">
            <label>
              Full Name
              <div className="input-box">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              Hospital Name
              <div className="input-box">
                <Building2 size={18} />
                <input
                  type="text"
                  placeholder="St. Mary Clinic"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>

          <div className="two-column">
            <label>
              Enterprise Email
              <div className="input-box">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="carter@stmary.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              Phone
              <div className="input-box">
                <Phone size={18} />
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>

          <div className="two-column">
            <label>
              Password
              <div className="input-box">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              Confirm Password
              <div className="input-box">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <span>
              I agree to the{" "}
              <span
                style={{
                  color: "#316bff",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Terms &amp; Privacy Policy
              </span>{" "}
              statements for compliance.
            </span>
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? (
              "Creating Account..."
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                Create Account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Already have an account?</span>
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("login");
            }}
          >
            Sign In
          </a>
        </footer>
      </section>
    </main>
  );
}