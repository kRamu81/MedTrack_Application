import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function LoginForm({ onNavigate }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8081/api/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid login credentials");
      }

      const user = await response.json();

      login(user);

      onNavigate(
        user.role === "hospital"
          ? "dashboard"
          : user.role === "technician"
          ? "tasks"
          : "orders"
      );

    } catch (err) {
      setError("Login failed. Check email or password.");
    }

    setLoading(false);
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

        {/* Role */}
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

        {/* Button */}
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