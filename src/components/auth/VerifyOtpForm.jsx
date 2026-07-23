import { useState } from "react";
import { verifyOtp } from "../../services/AuthService";
import MedTrackLogo from "../common/MedTrackLogo";

export default function VerifyOtpForm({ onNavigate, email }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d+$/.test(otp)) {
      setError("OTP must contain only digits.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      setSuccess("OTP verified successfully. Redirecting...");
      setTimeout(() => {
        onNavigate("reset-password", { email, otp });
      }, 1500);
    } catch (err) {
      console.error("OTP verification error:", err);
      if (err.response) {
        setError(err.response.data.message || "Invalid OTP.");
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
    fontSize: "16px",
    letterSpacing: "4px",
    textAlign: "center",
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
          Verify OTP
        </h2>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Enter the code sent to <br />
          <strong className="text-slate-700">{email || "your email"}</strong>
        </p>
      </div>

      {/* Local Development Notice */}
      <div
        className="mb-6 p-4 rounded-xl text-xs"
        style={{
          background: "#fffbeb",
          color: "#b45309",
          border: "1px solid #fde68a",
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          lineHeight: "1.5"
        }}
      >
        <span style={{ fontSize: "16px" }}>💡</span>
        <div>
          <strong>Local Development Notice:</strong> Since a real email server is not configured, please check your <strong>backend terminal logs</strong> or the <strong>H2 database console</strong> to retrieve the generated OTP.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-center"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}
          >
            {success}
          </div>
        )}

        {/* OTP Input */}
        <div>
          <label
            className="block text-xs font-semibold mb-2 tracking-widest uppercase text-center"
            style={{ color: "#475569" }}
          >
            Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
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
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>Need a different email?</span>
          <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
        </div>

        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate("forgot-password")}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: "#f1f5f9",
            color: "#0284c7",
            border: "1.5px solid #e0f2fe",
          }}
        >
          Change Email
        </button>
      </form>
    </div>
  );
}
