import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/AuthService";
import logo from "../../assets/logo.png";

export default function LoginForm({ onNavigate }) {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", role: "hospital" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginUser({ email: form.email, password: form.password });
      login(user);
      onNavigate(
        user.role === "hospital" ? "dashboard"
          : user.role === "technician" ? "tasks"
          : "orders"
      );
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

  const inputBase = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    color: "#0f172a",
    fontFamily: "inherit",
  };

  const focusIn = (e) => {
    e.target.style.borderColor = "#0ea5e9";
    e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
  };
  const focusOut = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="text-center mb-8">
        <img src={logo} alt="MedTrack Logo" className="h-10 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold" style={{ color: "#0f172a" }}>
          Welcome back
        </h2>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Sign in to your MedTrack account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

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
            style={{ color: "#475569" }}
          >
            Login As
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

        {/* Email */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#475569" }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@hospital.com"
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
          <div className="flex justify-between items-center mb-2">
            <label
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#475569" }}
            >
              Password
            </label>
            <button
              type="button"
              className="text-xs font-medium"
              style={{ color: "#0ea5e9" }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ ...inputBase, paddingRight: "44px" }}
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200"
          style={{
            background: loading
              ? "#94a3b8"
              : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
            boxShadow: loading ? "none" : "0 8px 20px rgba(14,165,233,0.35)",
            marginTop: "4px",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                style={{ animation: "spin 0.75s linear infinite" }}
              />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>New to MedTrack?</span>
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
        </div>

        {/* Register link */}
        <button
          type="button"
          onClick={() => onNavigate("register")}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: "#f1f5f9",
            color: "#0284c7",
            border: "1.5px solid #e0f2fe",
          }}
        >
          Create an Account
        </button>

      </form>
    </div>
  );
}