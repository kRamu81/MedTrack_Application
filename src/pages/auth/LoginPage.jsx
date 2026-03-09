import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE - MEDTRACK INFO */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 text-white">

        {/* Background Image */}
        <img
          src="https://i.pinimg.com/736x/69/f7/1d/69f71d88609cb0881627de9f98296c5f.jpg"
          alt="medical"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Content */}
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

          <div className="text-center mb-8">

            <div className="inline-flex items-center gap-2 mb-2">

              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">

                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                  />

                </svg>

              </div>

            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Sign in to your MedTrack account
            </p>

          </div>

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