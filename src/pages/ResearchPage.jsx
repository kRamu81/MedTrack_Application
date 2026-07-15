import { useState } from "react";

/**
 * ResearchPage Component
 * 
 * Showcases MedTrack's research papers, publications, and impact stats.
 * Includes interactive category filter buttons, a keyword search bar,
 * and collapsible abstract blocks for each paper.
 */
export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedPaperId, setExpandedPaperId] = useState(null);

  // Key research impact metrics
  const metrics = [
    { label: "Downtime Reduction", value: "34.2%", desc: "Average improvement in device availability" },
    { label: "Devices Monitored", value: "25k+", desc: "Active medical assets tracked across clinics" },
    { label: "Data Integrity", value: "99.98%", desc: "Reliable uptime for IoT and tracking feeds" },
  ];

  // List of publications with authors, abstracts, and categories
  const publications = [
    {
      id: 1,
      title: "Optimizing Medical Device Lifecycles in Sub-Saharan Clinics using QR Code Analytics",
      authors: "Dr. Kofi Boateng, Clara Vance, Dipanshu Batra",
      date: "October 2025",
      category: "device-lifecycle",
      abstract: "This paper analyzes the deployment of QR-code-based asset tracking systems in rural clinics. Our study demonstrates a significant reduction in device localization times and an overall 34.2% drop in maintenance response latency, proving the effectiveness of low-cost mobile identification schemes in low-resource environments.",
    },
    {
      id: 2,
      title: "A Decentralized Approach to Clinical Cold-Chain Monitoring using IoT & Smart Alerts",
      authors: "Marcus Chen, Sophia Alabi",
      date: "March 2024",
      category: "iot-telemetry",
      abstract: "Ensuring cold-chain integrity remains a major challenge in clinical logistics. This research introduces a telemetry tracking architecture using cellular IoT sensors. Real-time temperature alerts and predictive failures reduced vaccine and reagent waste rates by 48.7% over a 12-month pilot.",
    },
    {
      id: 3,
      title: "An Empirical Study on Role-Based Access Controls and Security Auditing in Shared Hospital Operations",
      authors: "Elena Rostova, Aaron Kojo",
      date: "January 2026",
      category: "security-chain",
      abstract: "Shared database platforms in clinical ecosystems present unique safety and authentication challenges. We detail an end-to-end framework integrating JWT-based session checks and row-level access filters to prevent data leakage between hospitals and third-party technicians while preserving audit transparency.",
    }
  ];

  // Categories metadata
  const categories = [
    { id: "all", label: "All Research" },
    { id: "device-lifecycle", label: "Device Lifecycles" },
    { id: "iot-telemetry", label: "IoT & Telemetry" },
    { id: "security-chain", label: "Security & Auditing" },
  ];

  // Filtering filter logic
  const filteredPublications = publications.filter((pub) => {
    const matchesCategory = activeCategory === "all" || pub.category === activeCategory;
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pub.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAbstract = (id) => {
    setExpandedPaperId(expandedPaperId === id ? null : id);
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      
      {/* Hero Header Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-b border-subtle">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
            Research & Telemetry
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-4 mb-6 tracking-tight">
            Impact Studies & Publications
          </h1>
          <p className="text-md text-secondary max-w-xl mx-auto leading-relaxed">
            Explore our research initiatives, system performance telemetry, and peer-reviewed whitepapers on optimizing healthcare asset management.
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-card border border-subtle rounded-3xl p-6 shadow-md shadow-black/[0.01]"
            >
              <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">
                {metric.value}
              </span>
              <h4 className="text-sm font-bold text-primary mt-2 mb-1">
                {metric.label}
              </h4>
              <p className="text-xs text-secondary leading-relaxed">
                {metric.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Main Area */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedPaperId(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                    : "bg-card text-secondary hover:bg-hover hover:text-primary border border-subtle"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar widget */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search papers & authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card text-primary placeholder-secondary border border-subtle rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

        </div>

        {/* Publications Accordion List */}
        <div className="space-y-4">
          {filteredPublications.length > 0 ? (
            filteredPublications.map((pub) => (
              <div
                key={pub.id}
                className="bg-card border border-subtle rounded-3xl p-8 hover:shadow-lg hover:shadow-black/[0.01] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2.5 py-1 rounded-full">
                      {pub.category.replace("-", " ")}
                    </span>
                    <h3 className="text-lg font-black text-primary mt-3 mb-2 leading-snug">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-secondary font-medium">
                      Published: <span className="font-bold text-primary">{pub.date}</span> • Authors: <span className="font-semibold text-primary">{pub.authors}</span>
                    </p>
                  </div>
                  
                  {/* Toggle button */}
                  <button
                    onClick={() => toggleAbstract(pub.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-hover border border-subtle text-secondary hover:text-primary rounded-lg text-xs font-bold transition-all whitespace-nowrap self-start"
                  >
                    <span>{expandedPaperId === pub.id ? "Hide Abstract" : "Read Abstract"}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedPaperId === pub.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Collapsible Abstract Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    expandedPaperId === pub.id
                      ? "max-h-[300px] border-t border-subtle/50 mt-6 pt-6 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    Abstract
                  </h5>
                  <p className="text-sm text-secondary leading-relaxed bg-surface/30 p-4 rounded-2xl border border-subtle/40">
                    {pub.abstract}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="bg-card border border-subtle rounded-[2rem] p-12 text-center">
              <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h4 className="text-md font-bold text-primary mb-2">No research papers found</h4>
              <p className="text-xs text-secondary max-w-xs mx-auto">
                No publications matched your search query or category filters. Please try checking another topic.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
