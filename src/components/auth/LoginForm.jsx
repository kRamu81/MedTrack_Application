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
        setError("Please enter a valid email and password.");
      }

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full">

      {/* Logo */}
      <div className="text-center mb-6">
        <img src={logo} alt="MedTrack Logo" className="h-10 mx-auto mb-2" />

        <h2 className="text-xl font-semibold text-gray-900">
          Welcome Back
        </h2>

        <p className="text-sm text-gray-500">
          Sign in to your MedTrack account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role Select */}
        <div>
          <label className="text-sm text-gray-600">Select Role</label>

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 mt-1"
          >
            <option value="hospital">Hospital Admin</option>
            <option value="technician">Technician</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">Email</label>

          <input
            type="email"
            placeholder="you@hospital.com"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-600">Password</label>

          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2 mt-1"
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>

      </form>
    </div>
  );
}