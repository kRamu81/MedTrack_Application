import { useState } from "react";

/**
 * AwardsPage Component
 * 
 * Showcases the certifications, industry accolades, and awards that MedTrack
 * has received. Includes an interactive category filter, hover animations,
 * and a certification grid.
 */
export default function AwardsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Categories list for filtering
  const categories = [
    { id: "all", label: "All Recognitions" },
    { id: "innovation", label: "Innovation & Tech" },
    { id: "healthcare", label: "Healthcare Impact" },
    { id: "security", label: "Security & Standards" },
  ];

  // List of awards and achievements
  const recognitions = [
    {
      id: 1,
      year: "2026",
      category: "healthcare",
      title: "African Union Healthcare Pioneer Award",
      issuer: "African Union Health Commission",
      description: "Recognized for driving systemic improvements in medical equipment uptime and logistics transparency across healthcare networks.",
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 2,
      year: "2025",
      category: "security",
      title: "ISO/IEC 27001 Certification",
      issuer: "International Organization for Standardization",
      description: "Awarded for demonstrating absolute compliance with international standard security management systems in patient and inventory tracking data.",
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 3,
      year: "2025",
      category: "innovation",
      title: "Digital Health Excellence Award",
      issuer: "World Health Organization (WHO)",
      description: "Honored for pioneering integration connecting medical inventory tracking systems to national biometric registry feeds in emerging economies.",
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 4,
      year: "2024",
      category: "innovation",
      title: "Best Healthcare Start-up",
      issuer: "Africa Tech Summit",
      description: "Awarded for constructing a highly resilient decentralized procurement and inventory management system for Sub-Saharan clinical facilities.",
      icon: (
        <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 5,
      year: "2023",
      category: "healthcare",
      title: "Global Health Innovation Prize",
      issuer: "United Nations (UN)",
      description: "Recognized for optimizing vaccine storage tracking systems and ensuring stable cold-chain device functionality through preventive maintenance tools.",
      icon: (
        <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ];

  // Filter list based on category state
  const filteredRecognitions = recognitions.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="bg-surface min-h-screen font-sans">
      
      {/* Hero Header Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-b border-subtle">
        
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
            Our Achievements
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-5 mb-6 tracking-tight">
            Awards & Accolades
          </h1>
          <p className="text-md text-secondary max-w-xl mx-auto leading-relaxed">
            Discover the international awards, tech achievements, and standards certifications that reinforce MedTrack's position as a secure health logistics pioneer.
          </p>
        </div>
      </section>

      {/* Interactive Tabs and Grid Content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "bg-card text-secondary hover:bg-hover hover:text-primary border border-subtle"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRecognitions.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-subtle rounded-3xl p-8 hover:shadow-xl hover:shadow-black/[0.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center border border-subtle">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-full">
                    {item.year}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-secondary mb-4 uppercase tracking-wider">
                  {item.issuer}
                </p>
                <p className="text-sm text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tag marker */}
              <div className="mt-6 pt-4 border-t border-subtle/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Security / Compliance Banner */}
        <div className="bg-card border border-subtle rounded-[2rem] p-10 mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">
              🛡️
            </div>
            <div>
              <h4 className="text-md font-bold text-primary mb-1">
                Committed to Security Standards
              </h4>
              <p className="text-xs text-secondary max-w-md leading-relaxed">
                Our infrastructure conforms to HIPAA, GDPR, and ISO standards, ensuring maximum safety for connected patient identities and medical logs.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = "mailto:compliance@medtrack.org"}
            className="px-6 py-3 bg-primary text-card hover:opacity-90 rounded-2xl text-xs font-bold transition-all shadow-md"
          >
            Verify Credentials
          </button>
        </div>

      </main>
    </div>
  );
}
