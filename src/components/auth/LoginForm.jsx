import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "hospital" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const DEMO_USERS = {
    hospital: { name: "City General Hospital", email: "hospital@demo.com", role: "hospital" },
    technician: { name: "Alex Technician", email: "tech@demo.com", role: "technician" },
    supplier: { name: "MedSupply Corp", email: "supplier@demo.com", role: "supplier" },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const demo = DEMO_USERS[form.role];
      if (form.email && form.password.length >= 4) {
        login({ ...demo, email: form.email });
        onNavigate(form.role === "hospital" ? "dashboard" : form.role === "technician" ? "tasks" : "orders");
      } else {
        setError("Please enter a valid email and password (min 4 chars).");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Login As</label>
        <div className="grid grid-cols-3 gap-2">
          {["hospital", "technician", "supplier"].map((role) => (
            <button
              type="button"
              key={role}
              onClick={() => setForm({ ...form, role })}
              className={`py-2.5 px-2 text-xs font-semibold rounded-lg border-2 capitalize transition-all ${
                form.role === role
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {role === "hospital" ? "🏥" : role === "technician" ? "🔧" : "📦"} {role}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@hospital.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
        </div>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </>
        ) : "Sign In"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={() => onNavigate("register")} className="text-blue-600 font-medium hover:underline">
          Create one
        </button>
      </p>
    </form>
  );
}
