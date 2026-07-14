import { useState } from "react";

/**
 * GuidesPage Component
 * 
 * Provides interactive operational manuals, step-by-step guides,
 * and checklists for Hospital Admins, Technicians, and Suppliers.
 * Supports searching and role-based filtering.
 */
export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [expandedGuideId, setExpandedGuideId] = useState(null);

  // Role categorization tabs
  const roles = [
    { id: "all", label: "All Roles", icon: "👥" },
    { id: "hospital", label: "Hospital Admins", icon: "🏥" },
    { id: "technician", label: "Technicians", icon: "🔧" },
    { id: "supplier", label: "Suppliers", icon: "📦" },
  ];

  // List of user guides and manuals
  const guides = [
    {
      id: 1,
      role: "hospital",
      title: "Inventory Setup & QR Code Printing",
      readTime: "4 min read",
      description: "Learn how to seed, bulk import, or manually add equipment items to your inventory and generate scannable tracking tags.",
      steps: [
        "Navigate to the 'Equipment' page from your dashboard sidebar.",
        "Click the 'Add Equipment' button to open the manual entry form, or select bulk import using a formatted CSV.",
        "Fill out crucial metadata including manufacturer, model, purchase date, and maintenance cycle details.",
        "After saving, locate the new device entry and click 'Download QR Code' or print the code directly to attach it to the asset."
      ]
    },
    {
      id: 2,
      role: "technician",
      title: "Claiming Maintenance Tasks & Logging Actions",
      readTime: "3 min read",
      description: "Step-by-step manual for field engineers to claim, start, update, and resolve maintenance tickets.",
      steps: [
        "Go to the 'My Tasks' dashboard tab to inspect tickets assigned to your technician profile.",
        "Click on a ticket to read the priority level, device specifications, and history log.",
        "Change the task status to 'In Progress' when beginning diagnostic or calibration work.",
        "Fill in resolution logs and mark the ticket as 'Completed' once the equipment is confirmed operational."
      ]
    },
    {
      id: 3,
      role: "supplier",
      title: "Order Fulfilment & Logistics Tracking",
      readTime: "5 min read",
      description: "Guide for suppliers to manage device procurement orders, generate invoices, and log shipment tracking.",
      steps: [
        "Access the 'Orders' list to check pending equipment requests from hospital systems.",
        "Review orders and accept requests to transition them into the fulfillment phase.",
        "Provide courier metadata and input the shipment tracking number using the status update modal.",
        "Monitor courier telemetry until delivery confirmation is uploaded by the receiving hospital."
      ]
    }
  ];

  // Filtering guides list
  const filteredGuides = guides.filter((guide) => {
    const matchesRole = activeRole === "all" || guide.role === activeRole;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleGuide = (id) => {
    setExpandedGuideId(expandedGuideId === id ? null : id);
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-b border-subtle">
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
            User Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-4 mb-6 tracking-tight">
            Operational Manuals
          </h1>
          <p className="text-md text-secondary max-w-xl mx-auto leading-relaxed">
            Follow our step-by-step checklists to perform tasks, update maintenance workflows, and manage clinical supplies.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Roles */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary px-3 mb-4">
              Roles & Audiences
            </h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-1.5 no-scrollbar">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRole(r.id);
                    setExpandedGuideId(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 w-full text-left ${
                    activeRole === r.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15 scale-[1.02]"
                      : "bg-card text-secondary hover:bg-hover hover:text-primary border border-subtle"
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section: Guides List */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search Input Widget */}
            <div className="relative group mb-6">
              <input
                type="text"
                placeholder="Search operational steps and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card text-primary placeholder-secondary border border-subtle rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
                <svg className="w-5 h-5 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {filteredGuides.length > 0 ? (
              <div className="space-y-4">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-card border border-subtle rounded-3xl p-8 hover:shadow-lg hover:shadow-black/[0.01] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2.5 py-1 rounded-full">
                            {guide.role}
                          </span>
                          <span className="text-xs font-semibold text-secondary">
                            {guide.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-primary mb-2 leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-secondary leading-relaxed">
                          {guide.description}
                        </p>
                      </div>
                      
                      {/* Toggle button */}
                      <button
                        onClick={() => toggleGuide(guide.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-hover border border-subtle text-secondary hover:text-primary rounded-lg text-xs font-bold transition-all whitespace-nowrap self-start"
                      >
                        <span>{expandedGuideId === guide.id ? "Hide Guide" : "Start Guide"}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGuideId === guide.id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Collapsible Steps Content */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        expandedGuideId === guide.id
                          ? "max-h-[600px] border-t border-subtle/50 mt-6 pt-6 opacity-100"
                          : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
                      }`}
                    >
                      <h5 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
                        Actionable Steps Checklist
                      </h5>
                      <div className="space-y-4">
                        {guide.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-secondary leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="bg-card border border-subtle rounded-[2rem] p-12 text-center">
                <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔍
                </div>
                <h4 className="text-md font-bold text-primary mb-2">No guides found</h4>
                <p className="text-xs text-secondary max-w-xs mx-auto">
                  No manuals matched your search criteria. Please refine your query or choose another role.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
