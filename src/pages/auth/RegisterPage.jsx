import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)"
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-[-60px] w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #6ee7b7, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a7f3d0, transparent 70%)" }}
        />

        {/* Brand */}
        <div className="relative z-10 px-12 pt-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}
            >
              M
            </div>
            <span className="text-white font-bold text-xl tracking-wide">MedTrack</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 px-12 flex-1 flex flex-col justify-center">
          <div
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 w-fit"
            style={{ background: "rgba(52,211,153,0.15)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.3)" }}
          >
            Join 200+ Healthcare Organizations
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Start Managing<br />
            Smarter with <span style={{ color: "#34d399" }}>MedTrack</span>
          </h1>

          <p className="text-base mb-10" style={{ color: "#6ee7b7", opacity: 0.8 }}>
            Set up your hospital, technician, or supplier account in minutes
            and take control of your medical equipment lifecycle.
          </p>

          {/* Step cards */}
          <div className="space-y-3">
            {[
              { step: "01", title: "Create Your Account", desc: "Fill in your details and choose your role" },
              { step: "02", title: "Set Up Your Profile", desc: "Configure your organization settings" },
              { step: "03", title: "Start Tracking", desc: "Monitor equipment, tasks & orders instantly" },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}
                >
                  {step}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-xs" style={{ color: "#6ee7b7", opacity: 0.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div
          className="relative z-10 mx-8 mb-10 px-6 py-5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm italic mb-3" style={{ color: "#a7f3d0" }}>
            "MedTrack transformed how we handle equipment — from chaos to complete clarity."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}
            >
              DR
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Dr. Rajan</div>
              <div className="text-xs" style={{ color: "#6ee7b7", opacity: 0.7 }}>City General Hospital</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-hidden"
        style={{ background: "#f0fdf4" }}
      >
        {/* Subtle background blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #bbf7d0, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #a7f3d0, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div
            className="rounded-3xl p-8 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 25px 50px rgba(6,95,70,0.12), 0 0 0 1px rgba(255,255,255,0.6)"
            }}
          >
            <RegisterForm onNavigate={onNavigate} />
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#6b7280" }}>
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "#059669" }}>Terms of Service</span>{" "}
            &amp;{" "}
            <span className="underline cursor-pointer" style={{ color: "#059669" }}>Privacy Policy</span>
          </p>
        </div>
      </div>

    </div>
  );
}