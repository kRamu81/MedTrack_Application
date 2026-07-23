import { useState } from "react";
import { resetPassword } from "../../services/AuthService";
import MedTrackLogo from "../common/MedTrackLogo";

export default function ResetPasswordForm({ onNavigate, email, otp }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess("Password reset successfully! Redirecting to Sign In...");
      setTimeout(() => {
        onNavigate("login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response) {
        setError(err.response.data.message || "Failed to reset password.");
      } else {
        setError("Server not responding. Please try again.");
      }
    }
    setLoading(false);
  };

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

  const strength = getStrength(newPassword);

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
        <div className="flex justify-center mb-3">
          <MedTrackLogo size="text-2xl" />
        </div>
        <h2 className="text-2xl font-extrabold" style={{ color: "#0f172a" }}>
          New Password
        </h2>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Set a secure new password for your account
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

        {/* Success */}
        {success && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}
          >
            {success}
          </div>
        )}

        {/* New Password */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase"
            style={{ color: "#475569" }}
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Strength bar */}
          {newPassword && (
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
            style={{ color: "#475569" }}
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{
                ...inputBase,
                paddingRight: "44px",
                borderColor:
                  confirm && confirm !== newPassword
                    ? "#fca5a5"
                    : "#e2e8f0",
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
          {confirm && confirm !== newPassword && (
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
              Resetting password...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
