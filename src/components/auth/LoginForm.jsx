import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function LoginForm({ onNavigate }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "hospital",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const DEMO_USERS = {
    hospital: {
      name: "City General Hospital",
      email: "hospital@demo.com",
      role: "hospital",
    },
    technician: {
      name: "Alex Technician",
      email: "tech@demo.com",
      role: "technician",
    },
    supplier: {
      name: "MedSupply Corp",
      email: "supplier@demo.com",
      role: "supplier",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const demo = DEMO_USERS[form.role];

      if (form.email && form.password.length >= 4) {
        login({ ...demo, email: form.email });

        onNavigate(
          form.role === "hospital"
            ? "dashboard"
            : form.role === "technician"
            ? "tasks"
            : "orders"
        );
      } else {
        setError("Please enter a valid email and password (min 4 characters).");
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full">

      {/* Logo + Heading */}
      <div className="text-center mb-6">

        <div className="flex justify-center mb-3">
          <img
            src={logo}
            alt="MedTrack Logo"
            className="h-10"
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back
        </h2>

        <p className="text-sm text-gray-500">
          Sign in to your MedTrack account
        </p>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Login As
          </label>

          <div className="grid grid-cols-3 gap-2">
            {["hospital", "technician", "supplier"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`py-2 text-xs font-semibold rounded-md border-2 capitalize transition-all ${
                  form.role === role
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="you@hospital.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <a href="#" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="text-blue-600 font-medium hover:underline"
          >
            Create one
          </button>
        </p>

      </form>
    </div>
  );
}