import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/AuthService";
import MedTrackLogo from "../../components/common/MedTrackLogo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Hospital,
  Layers,
  Lock,
  Mail,
  Phone,
  User,
  Wrench,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 3 || pw.length < 10) return { score, label: "Fair", color: "#f59e0b" };
  return { score, label: "Strong", color: "#10b981" };
}

const roleOptions = [
  { key: "hospital", title: "Hospital", label: "Hospital (Equipment & Asset Management)", orgLabel: "Hospital Name", orgPlaceholder: "St. Mary Clinic" },
  { key: "technician", title: "Technician", label: "Technician (Maintenance & Repairs)", orgLabel: "Organization", orgPlaceholder: "MedCare Services" },
  { key: "supplier", title: "Supplier", label: "Supplier (Vendor & Orders)", orgLabel: "Company Name", orgPlaceholder: "BioMed Supplies Inc." },
];

export default function RegisterPage({ onNavigate, defaultRole }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(
    defaultRole ? defaultRole.toLowerCase() : "hospital"
  );
  const [fullName, setFullName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.set(".auth-card", { opacity: 0, y: 40 });
    gsap.set(".auth-header, .auth-title, .auth-form, .auth-footer", { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".auth-card", {
      opacity: 1,
      y: 0,
      duration: 0.8,
    })
    .to(".auth-header, .auth-title, .auth-form, .auth-footer", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
    }, "-=0.4");
  }, { scope: containerRef });

  const currentRoleObj = roleOptions.find((r) => r.key === selectedRole) || roleOptions[0];
  const RoleIcon = selectedRole === "technician" ? Wrench : selectedRole === "supplier" ? Layers : Hospital;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordMismatch) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: fullName,
        email: email,
        password: password,
        phone: phone,
        organization: hospitalName,
        role: selectedRole.toUpperCase(),
      });

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
          <MedTrackLogo size="text-xl" />
          <span className="platform-badge">Healthcare Platform</span>
        </header>

        <div className="auth-title">
          <h1>
            Create Your
            <br />
            <span>Account</span>
          </h1>
          <p>Join MedTrack to manage equipment lifecycle and maintenance.</p>
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
              {currentRoleObj.orgLabel}
              <div className="input-box">
                <Building2 size={18} />
                <input
                  type="text"
                  placeholder={currentRoleObj.orgPlaceholder}
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
                  placeholder="name@company.com"
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
                  placeholder="+91 XXXXX XXXXX"
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
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby={password ? "password-strength" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div id="password-strength" className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          background:
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : "#e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.score <= 1 ? "#b91c1c" : passwordStrength.score <= 3 || password.length < 10 ? "#b45309" : "#047857" }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </label>

            <label>
              Confirm Password
              <div className="input-box">
                <Lock size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="•••••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-invalid={passwordMismatch}
                  aria-describedby={confirmPassword ? "confirm-password-msg" : undefined}
                  style={
                    passwordMismatch
                      ? { borderColor: "#fca5a5" }
                      : confirmPassword && !passwordMismatch
                      ? { borderColor: "#86efac" }
                      : {}
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {confirmPassword && (
                <div id="confirm-password-msg" className="field-hint" style={{ color: passwordMismatch ? "#ef4444" : "#10b981", fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>
                  {passwordMismatch ? "Passwords do not match" : "Passwords match"}
                </div>
              )}
            </label>
          </div>

          <label>
            Select Role
            <div className="input-box">
              <RoleIcon size={18} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="auth-select"
                required
              >
                {roleOptions.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="select-chevron" />
            </div>
          </label>

          <label className="checkbox-label" style={{ marginTop: "4px" }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <span>
              I agree to the{" "}
              <a
                href="/terms"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate("terms");
                  }
                }}
                className="link-button"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate("privacy");
                  }
                }}
                className="link-button"
              >
                Privacy Policy
              </a>
            </span>
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <footer className="auth-footer" style={{ marginTop: "24px" }}>
          <span>Already have an account?</span>
          <a
            href="/login"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate("login");
              }
            }}
          >
            Sign In
          </a>
        </footer>
      </section>
    </main>
  );
}