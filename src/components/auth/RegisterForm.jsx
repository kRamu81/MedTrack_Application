import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/AuthService";
import logo from "../../assets/logo.png";

export default function RegisterForm({ onNavigate }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "hospital",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      login(user);
      onNavigate("login");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        setError(err.response.data.message || "Registration failed.");
      } else {
        setError("Server not responding. Please try again.");
      }
    }
    setLoading(false);
  };

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { score, label: "Fair", color: "#f59e0b" };
    return { score, label: "Strong", color: "#10b981" };
  };

  const strength = getStrength(form.password);

  const inputBase = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    background: "#f8faf9",
    border: "1.5px solid #d1fae5",
    color: "#0f172a",
    fontFamily: "inherit",
  };

  const focusIn = (e) => {
    e.target.style.borderColor = "#10b981";
    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.12)";
  };
  const focusOut = (e) => {
    e.target.style.borderColor = "#d1fae5";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="text-center mb-7">
        <img src={logo} alt="MedTrack Logo" className="h-10 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold" style={{ color: "#064e3b" }}>
          Create your account
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Join MedTrack and manage your equipment lifecycle
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {/* Role */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#065f46" }}
          >
            Register As
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ ...inputBase, cursor: "pointer" }}
            onFocus={focusIn}
            onBlur={focusOut}
          >
            <option value="hospital">Hospital Admin</option>
            <option value="technician">Technician</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#065f46" }}
          >
            Full Name / Organization
          </label>
          <input
            type="text"
            placeholder="City General Hospital"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Email */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#065f46" }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="admin@hospital.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#065f46" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ ...inputBase, paddingRight: "52px" }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
              style={{ color: "#94a3b8" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Strength bar */}
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength.score ? strength.color : "#e2e8f0" }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: strength.color }}>
                {strength.label} password
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#065f46" }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
              style={{
                ...inputBase,
                paddingRight: "52px",
                borderColor:
                  form.confirm && form.confirm !== form.password
                    ? "#fca5a5"
                    : "#d1fae5",
              }}
              onFocus={focusIn}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
              style={{ color: "#94a3b8" }}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
          {form.confirm && form.confirm !== form.password && (
            <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
              Passwords don't match
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200"
          style={{
            background: loading
              ? "#94a3b8"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow: loading ? "none" : "0 8px 20px rgba(16,185,129,0.35)",
            marginTop: "6px",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                style={{ animation: "spin 0.75s linear infinite" }}
              />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#d1fae5" }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>Already registered?</span>
          <div className="flex-1 h-px" style={{ background: "#d1fae5" }} />
        </div>

        {/* Login link */}
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{ background: "#f0fdf4", color: "#059669", border: "1.5px solid #bbf7d0" }}
        >
          Sign In Instead
        </button>

      </form>
    </div>
  );
}