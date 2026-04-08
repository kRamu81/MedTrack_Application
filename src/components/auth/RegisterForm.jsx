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
    role: "hospital"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // password match check
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    // password length check
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
        role: form.role
      });

      // save user
      login(user);

      // navigate to login page
      onNavigate("login");

    } catch (err) {

      console.error("Registration error:", err);

      if (err.response) {
        setError(err.response.data.message || "Registration failed.");
      } else {
        setError("Server not responding.");
      }

    }

    setLoading(false);
  };

  const fields = [
    {
      key: "name",
      label: "Full Name / Organization",
      type: "text",
      placeholder: "City General Hospital"
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      placeholder: "admin@hospital.com"
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "Min. 6 characters"
    },
    {
      key: "confirm",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter password"
    }
  ];

  return (
    <div>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="MedTrack Logo" className="h-10" />
      </div>

      {/* Heading */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Create your account
        </h2>

        <p className="text-sm text-gray-500">
          Join MedTrack to manage your equipment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Register As
          </label>

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="hospital">Hospital Admin</option>
            <option value="technician">Technician</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>

        {/* Inputs */}
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {label}
            </label>

            <input
              type={type}
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </button>
        </p>

      </form>
    </div>
  );
}