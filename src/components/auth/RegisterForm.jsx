import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
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

  const handleSubmit = (e) => {
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

    setTimeout(() => {
      login({ name: form.name, email: form.email, role: form.role });

      onNavigate(
        form.role === "hospital"
          ? "dashboard"
          : form.role === "technician"
          ? "tasks"
          : "orders"
      );

      setLoading(false);
    }, 1000);
  };

  const fields = [
    { key: "name", label: "Full Name / Organization", type: "text", placeholder: "City General Hospital" },
    { key: "email", label: "Email Address", type: "email", placeholder: "admin@hospital.com" },
    { key: "password", label: "Password", type: "password", placeholder: "Min. 6 characters" },
    { key: "confirm", label: "Confirm Password", type: "password", placeholder: "Re-enter password" },
  ];

  return (
    <div>
      {/* Logo under heading */}
      <div className="flex justify-center mb-6">
        <img
          src={logo}
          alt="MedTrack Logo"
          className="h-10"
        />
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

        {/* Register Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Register As
          </label>

          <div className="grid grid-cols-3 gap-2">
            {["hospital", "technician", "supplier"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`py-2.5 text-xs font-semibold rounded-lg border-2 capitalize transition-all ${
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
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
        ))}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
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