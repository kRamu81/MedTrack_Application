import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE - MEDTRACK INFO */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 text-white">

        <img
          src="https://i.pinimg.com/736x/69/f7/1d/69f71d88609cb0881627de9f98296c5f.jpg"
          alt="medical"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="relative z-10 flex flex-col justify-center px-16">

          <h1 className="text-4xl font-bold mb-6">
            MedTrack Platform
          </h1>

          <p className="text-lg opacity-90 mb-6">
            A modern system to manage hospital equipment, maintenance schedules,
            and supplier orders in one secure platform.
          </p>

          <div className="space-y-4 text-sm">

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              Track hospital equipment inventory
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              Schedule equipment maintenance
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              Manage technician tasks
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              Supplier equipment ordering system
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDE - LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6">

        <div className="w-full max-w-md">

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <LoginForm onNavigate={onNavigate} />
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by HIPAA-compliant security standards
          </p>

        </div>

      </div>

    </div>
  );
}