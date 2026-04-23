import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0e7490 100%)"
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-[-60px] w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7dd3fc, transparent 70%)" }}
        />

        {/* Brand */}
        <div className="relative z-10 px-12 pt-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)" }}
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
            style={{ background: "rgba(56,189,248,0.15)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            Trusted by 200+ Hospitals
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            The Smarter Way<br />
            to Manage <span style={{ color: "#38bdf8" }}>Medical<br />Equipment</span>
          </h1>

          <p className="text-base mb-10" style={{ color: "#94a3b8" }}>
            Track inventory, schedule maintenance &amp; coordinate
            supplier orders — all in one powerful platform.
          </p>

          {/* Feature cards */}
          <div className="space-y-3">
            {[
              { title: "Equipment Inventory", desc: "Real-time tracking across all departments" },
              { title: "Maintenance Scheduling", desc: "Assign & monitor technician tasks" },
              { title: "Supplier Orders", desc: "Streamlined procurement workflow" },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#38bdf8" }}
                />
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-xs" style={{ color: "#64748b" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat bar */}
        <div
          className="relative z-10 mx-8 mb-10 px-6 py-4 rounded-2xl flex justify-between"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[["200+", "Hospitals"], ["5K+", "Equipment"], ["99.9%", "Uptime"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-white font-bold text-lg" style={{ color: "#38bdf8" }}>{num}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 relative"
        style={{ background: "#f8fafc" }}
      >
        {/* Subtle background blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #e0f2fe, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #bae6fd, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div
            className="rounded-3xl p-8 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 25px 50px rgba(14,116,144,0.12), 0 0 0 1px rgba(255,255,255,0.6)"
            }}
          >
            <LoginForm onNavigate={onNavigate} />
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#94a3b8" }}>
            Protected by HIPAA-compliant security standards
          </p>
        </div>
      </div>

    </div>
  );
}