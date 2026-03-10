export default function LandingPage({ onNavigate }) {
  const features = [
    { 
      img: "https://images.unsplash.com/photo-1580281658629-8e7e8b1d3c8d",
      title: "Hospital Management", 
      desc: "Track equipment, schedule maintenance, and monitor operational status across all departments." 
    },
    { 
      img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758",
      title: "Technician Portal", 
      desc: "Manage repair tasks, log work progress, and submit maintenance reports in real-time." 
    },
    { 
      img: "https://images.unsplash.com/photo-1581091215367-59ab6a84a5c6",
      title: "Supplier Integration", 
      desc: "Process orders, track deliveries, and manage spare parts inventory seamlessly." 
    },
    { 
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      title: "Live Analytics", 
      desc: "Visual dashboards showing equipment health, maintenance trends, and operational KPIs." 
    },
    { 
      img: "https://images.unsplash.com/photo-1588776814546-ec7e1e6e6e26",
      title: "Smart Alerts", 
      desc: "Automated notifications for overdue maintenance, low inventory, and equipment failures." 
    },
    { 
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      title: "HIPAA Compliant", 
      desc: "Enterprise-grade security with role-based access control and full audit trails." 
    },
  ];

  const stats = [
    { value: "500+", label: "Hospitals Served" },
    { value: "12,000+", label: "Devices Tracked" },
    { value: "99.8%", label: "Uptime SLA" },
    { value: "40%", label: "Downtime Reduced" },
  ];

  const roles = [
    {
      img: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc",
      role: "Hospital Admin",
      desc: "Get a bird's-eye view of your entire equipment fleet. Manage maintenance schedules and supplier orders.",
      color: "blue",
      page: "login",
    },
    {
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      role: "Technician",
      desc: "Access your assigned maintenance tasks, update job status, and log detailed service reports.",
      color: "purple",
      page: "login",
    },
    {
      img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232",
      role: "Supplier",
      desc: "Process incoming equipment orders, manage inventory, and track shipment status for hospitals.",
      color: "emerald",
      page: "login",
    },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="relative bg-white text-gray-900 overflow-hidden">

  {/* Grid background */}
  <div className="absolute inset-0 opacity-30 
  bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
  bg-[size:60px_60px]"></div>

  <div className="relative max-w-7xl mx-auto px-6 py-28">

    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
      Medical Equipment Management Platform
    </span>

    <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
      Keep your equipment <br />
      <span className="text-blue-600">always ready.</span>
    </h1>

    <p className="text-gray-600 text-lg max-w-xl mb-10 leading-relaxed">
      MedTrack connects hospitals, technicians, and suppliers in one unified
      platform — ensuring zero downtime, complete traceability, and optimized
      equipment lifecycles.
    </p>

    <div className="flex gap-4">

      <button
        onClick={() => onNavigate("register")}
        className="px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-md"
      >
        Get Started Free
      </button>

      <button
        onClick={() => onNavigate("login")}
        className="px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
      >
        Sign In →
      </button>

    </div>

  </div>

</section>
      {/* Stats */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-blue-400">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 overflow-hidden">

  {/* Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#1f3a6d] via-[#1e4f73] to-[#1f7a74]"></div>

  {/* Grid Pattern */}
  <div className="absolute inset-0 opacity-20 
  bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff30_1px,transparent_1px)]
  bg-[size:80px_80px]"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-white mb-3">
        Everything your facility needs
      </h2>
      <p className="text-blue-100 max-w-xl mx-auto">
        A complete toolkit for managing the full lifecycle of medical equipment — from procurement to disposal.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {features.map((f) => (
        <div
          key={f.title}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all"
        >

          <img
            src={f.img}
            alt={f.title}
            className="w-14 h-14 object-cover rounded-lg mb-3"
          />

          <h3 className="font-bold text-gray-900 mt-3 mb-2">{f.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>

        </div>
      ))}

    </div>

  </div>
</section>
      {/* Role Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Built for every stakeholder
            </h2>
            <p className="text-gray-500">
              Three tailored portals. One unified system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {roles.map((r) => (
              <div key={r.role} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 p-7 text-center hover:shadow-xl transition-all">

                <img
                  src={r.img}
                  alt={r.role}
                  className="w-16 h-16 object-cover rounded-xl mx-auto mb-4"
                />

                <h3 className="font-bold text-gray-900 text-lg mt-4 mb-2">{r.role}</h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {r.desc}
                </p>

                <button
                  onClick={() => onNavigate(r.page)}
                  className="w-full py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Login as {r.role.split(" ")[0]}
                </button>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 text-white overflow-hidden">

  {/* Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#1f3a6d] via-[#1e4f73] to-[#1f7a74]"></div>

  {/* Grid Pattern */}
  <div className="absolute inset-0 opacity-20
  bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff30_1px,transparent_1px)]
  bg-[size:80px_80px]"></div>

  <div className="relative max-w-3xl mx-auto px-4 text-center">

    <h2 className="text-3xl font-bold mb-4">
      Start managing smarter today
    </h2>

    <p className="text-blue-100 mb-8 text-lg">
      Join hundreds of hospitals already using MedTrack to reduce equipment downtime and cut maintenance costs.
    </p>

    <button
      onClick={() => onNavigate("register")}
      className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
    >
      Create Free Account
    </button>

  </div>

</section>

    </div>
  );
}