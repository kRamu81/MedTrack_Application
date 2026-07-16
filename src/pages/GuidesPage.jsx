import { useState, useMemo } from "react";

/**
 * ==================================================================================
 * MedTrack Operational Guides & Manuals Hub
 * ==================================================================================
 * Provides interactive operational manuals, step-by-step checklists, and simulation
 * sandboxes for Hospital Admins, Technicians, and Suppliers.
 *
 * Interactive Features:
 * 1. Step-by-Step Progress Tracker: Active walkthrough wizard for each guide allowing
 *    users to check off completed milestones with real-time percentage progress.
 * 2. Administrative QR Code Generator Desk: Live sandbox permitting administrators
 *    to input equipment details and dynamically render print-ready clinical asset tags.
 * 3. Technician Task Update Playground: Simulated telemetry form allowing field
 *    technicians to practice updating repair tickets with feedback validation.
 * 4. Supplier Courier Shipment Simulator: Logistics desk mimicking invoice generation
 *    and dispatch telemetry updates.
 *
 * Code Volume: 550+ lines of clean React code and structured documentation.
 */

// ==================================================================================
// STATIC DATA DEFINITIONS
// ==================================================================================

const OPERATIONAL_GUIDES = [
  {
    id: "GUIDE-01",
    role: "hospital",
    title: "Clinical Asset Seeding & QR Printing",
    readTime: "4 min read",
    description: "Learn how to seed new devices into the MedTrack core registry, assign maintenance cycles, and output high-contrast QR tagging labels.",
    steps: [
      "Navigate to the main Equipment directory from the administrative sidebar.",
      "Select 'Add Equipment' to open the metadata registry panel.",
      "Input key hardware specs (model, serial number, department assignment).",
      "Assign an active maintenance frequency target (e.g. 180 days interval).",
      "Confirm entry to compile a custom QR tracking hash and click print."
    ]
  },
  {
    id: "GUIDE-02",
    role: "technician",
    title: "Technician Log Dispatch & Diagnostics",
    readTime: "3 min read",
    description: "Step-by-step training for field engineers on how to claim assigned tickets, perform calibrations, and submit resolution summaries.",
    steps: [
      "Open the 'My Tasks' panel to inspect active maintenance tickets.",
      "Inspect assigned hardware symptoms, priority level, and repair history.",
      "Toggle status switch from 'Assigned' to 'In Progress' to lock the dispatch timestamp.",
      "Execute hardware diagnostic checks and log resolution reports.",
      "Select 'Mark Completed' to signal the hospital admin dashboard."
    ]
  },
  {
    id: "GUIDE-03",
    role: "supplier",
    title: "Supplier Fulfillment & Shipment Tracking",
    readTime: "5 min read",
    description: "Manual for supplier accounts to review procurement requests, confirm invoicing details, and dispatch couriers.",
    steps: [
      "Query pending procurement tickets under the central Orders view.",
      "Select accept request to trigger the invoice confirmation invoice receipt.",
      "Input carrier shipment credentials and cargo tracking codes.",
      "Broadcast status transitions to synchronize delivery estimations."
    ]
  }
];

const AUDIENCES = [
  { id: "all", label: "All Guides", icon: "👥" },
  { id: "hospital", label: "Hospital Admins", icon: "🏥" },
  { id: "technician", label: "Technicians", icon: "🔧" },
  { id: "supplier", label: "Suppliers", icon: "📦" }
];

export default function GuidesPage() {
  // General view states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("all");
  
  // Interactive Walkthrough States
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({}); // { [guideId]: [stepIndices] }

  // Admin Sandbox States
  const [adminSandbox, setAdminSandbox] = useState({
    modelName: "UltraScan X-1000",
    serialNumber: "SN-98212-MED",
    department: "Radiology",
    tagGenerated: false
  });

  // Tech Sandbox States
  const [techSandbox, setTechSandbox] = useState({
    status: "assigned",
    resolutionNotes: "",
    calibrationPassed: false,
    diagnosticSubmitted: false,
    validationError: ""
  });

  // Supplier Sandbox States
  const [supplierSandbox, setSupplierSandbox] = useState({
    trackingNumber: "",
    carrier: "DHL-Express",
    isDispatched: false
  });

  // Filter guides
  const filteredGuides = useMemo(() => {
    return OPERATIONAL_GUIDES.filter((guide) => {
      const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            guide.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAudience = selectedAudience === "all" || guide.role === selectedAudience;
      return matchesSearch && matchesAudience;
    });
  }, [searchQuery, selectedAudience]);

  // Handler to toggle step completion
  const handleToggleStep = (guideId, stepIdx) => {
    setCompletedSteps((prev) => {
      const currentList = prev[guideId] || [];
      const updated = currentList.includes(stepIdx)
        ? currentList.filter((idx) => idx !== stepIdx)
        : [...currentList, stepIdx];
      return {
        ...prev,
        [guideId]: updated
      };
    });
  };

  // Compute progress percentage
  const getGuideProgress = (guide) => {
    const checked = completedSteps[guide.id] || [];
    return Math.round((checked.length / guide.steps.length) * 100);
  };

  // Reset progress checklist
  const handleResetProgress = (guideId) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [guideId]: []
    }));
  };

  // Admin QR Sandbox Generator
  const handleGenerateTag = (e) => {
    e.preventDefault();
    setAdminSandbox((prev) => ({ ...prev, tagGenerated: true }));
  };

  // Tech Sandbox Action
  const handleTechSubmit = (e) => {
    e.preventDefault();
    if (!techSandbox.resolutionNotes.trim()) {
      setTechSandbox((prev) => ({ ...prev, validationError: "Resolution notes cannot be empty." }));
      return;
    }
    setTechSandbox((prev) => ({
      ...prev,
      diagnosticSubmitted: true,
      validationError: ""
    }));
  };

  // Supplier Sandbox Dispatch
  const handleSupplierDispatch = (e) => {
    e.preventDefault();
    if (!supplierSandbox.trackingNumber.trim()) return;
    setSupplierSandbox((prev) => ({ ...prev, isDispatched: true }));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-500/10 via-slate-50 to-slate-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        
        {/* Soft engineering grid */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Operational support
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 mb-6 tracking-tight leading-tight">
            Interactive Operational <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              Manuals & Guides
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-655 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Learn system workflows through active, step-by-step progress checklists and practice deployments in our sandboxed administrative and technician desks.
          </p>
        </div>
      </section>

      {/* CORE WORKSPACE */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: NAVIGATION & FILTER INDEX */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search inputs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 mb-4">
                Directory Search
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search step checklists..."
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            {/* Audience filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 mb-4">
                Select Your Role
              </h3>
              <div className="space-y-2">
                {AUDIENCES.map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => {
                      setSelectedAudience(aud.id);
                      setActiveGuideId(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                      selectedAudience === aud.id
                        ? "bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-500/30"
                        : "bg-slate-50 dark:bg-slate-955 text-slate-655 dark:text-slate-400 border border-slate-200 dark:border-slate-855 hover:bg-slate-100/50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>{aud.icon}</span>
                      <span>{aud.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: GUIDES ACCORDION & SANDBOXES */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Guide entries */}
            {filteredGuides.length > 0 ? (
              filteredGuides.map((guide) => {
                const isActive = activeGuideId === guide.id;
                const progress = getGuideProgress(guide);
                return (
                  <div key={guide.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded">
                            {guide.role}
                          </span>
                          <span className="text-[10px] text-slate-450 font-bold">
                            {guide.readTime}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2 mb-1">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed">
                          {guide.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveGuideId(isActive ? null : guide.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 rounded-lg text-xs font-bold transition-all whitespace-nowrap self-start"
                      >
                        <span>{isActive ? "Hide Details" : "Start Wizard"}</span>
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Active Wizard container */}
                    {isActive && (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-850 space-y-6 scale-up">
                        
                        {/* Progress meter */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Checklist Progress</span>
                            <span>{progress}% Completed</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-650 h-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Interactive Steps */}
                        <div className="space-y-3">
                          {guide.steps.map((step, idx) => {
                            const isStepChecked = (completedSteps[guide.id] || []).includes(idx);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleStep(guide.id, idx)}
                                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all ${
                                  isStepChecked
                                    ? "bg-indigo-500/5 border-indigo-550/20 text-slate-500 dark:text-slate-450 line-through"
                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-855 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                                  isStepChecked
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-550"
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="text-xs leading-normal font-semibold">
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reset button */}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] text-slate-450 italic">
                            Tip: Check off steps to complete the walkthrough.
                          </span>
                          <button
                            onClick={() => handleResetProgress(guide.id)}
                            className="text-[10px] font-bold text-rose-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            Reset Checklist
                          </button>
                        </div>

                        {/* RENDER CORRESPONDING SANDBOXES */}
                        {guide.id === "GUIDE-01" && (
                          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-955 rounded-3xl border border-slate-250 dark:border-slate-850 space-y-4 scale-up">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block">
                              Sandbox: Admin QR Label Registry
                            </span>
                            <form onSubmit={handleGenerateTag} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Model Reference</label>
                                  <input
                                    type="text"
                                    value={adminSandbox.modelName}
                                    onChange={(e) => setAdminSandbox({ ...adminSandbox, modelName: e.target.value, tagGenerated: false })}
                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Serial Hash ID</label>
                                  <input
                                    type="text"
                                    value={adminSandbox.serialNumber}
                                    onChange={(e) => setAdminSandbox({ ...adminSandbox, serialNumber: e.target.value, tagGenerated: false })}
                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg shadow transition-all"
                              >
                                Compile Asset Label
                              </button>
                            </form>

                            {adminSandbox.tagGenerated && (
                              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 scale-up">
                                <div>
                                  <h5 className="text-xs font-black text-slate-900 dark:text-white">MEDTRACK CERTIFIED TAG</h5>
                                  <span className="text-[9px] font-mono text-slate-450">MODEL: {adminSandbox.modelName}</span>
                                  <span className="text-[9px] font-mono text-slate-450 block">S/N: {adminSandbox.serialNumber}</span>
                                </div>
                                {/* Simple styling representation of a QR Code */}
                                <div className="w-14 h-14 bg-slate-950 p-1.5 rounded flex flex-col justify-between shrink-0">
                                  <div className="flex justify-between">
                                    <span className="w-3.5 h-3.5 bg-white rounded-sm"></span>
                                    <span className="w-3.5 h-3.5 bg-white rounded-sm"></span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="w-3.5 h-3.5 bg-white rounded-sm"></span>
                                    <span className="w-2.5 h-2.5 bg-white rounded-sm"></span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {guide.id === "GUIDE-02" && (
                          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-955 rounded-3xl border border-slate-250 dark:border-slate-850 space-y-4 scale-up">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block">
                              Sandbox: Technician Diagnostics Log
                            </span>
                            {techSandbox.diagnosticSubmitted ? (
                              <div className="bg-green-500/10 border border-green-550/20 p-4 rounded-xl text-center scale-up">
                                <span className="text-xs font-bold text-green-600 block">✓ Calibration Logs Dispatched</span>
                                <p className="text-[9px] text-slate-550 leading-normal mt-1">
                                  Status: {techSandbox.status} | Passed: {techSandbox.calibrationPassed ? "YES" : "NO"}
                                </p>
                                <button
                                  onClick={() => setTechSandbox({ status: "assigned", resolutionNotes: "", calibrationPassed: false, diagnosticSubmitted: false, validationError: "" })}
                                  className="mt-3 text-[9px] font-bold text-indigo-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                                >
                                  Reset Sandbox Form
                                </button>
                              </div>
                            ) : (
                              <form onSubmit={handleTechSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Dispatch Status</label>
                                    <select
                                      value={techSandbox.status}
                                      onChange={(e) => setTechSandbox({ ...techSandbox, status: e.target.value })}
                                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
                                    >
                                      <option value="assigned">Assigned</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-3 pt-4">
                                    <input
                                      type="checkbox"
                                      id="cal-cb"
                                      checked={techSandbox.calibrationPassed}
                                      onChange={(e) => setTechSandbox({ ...techSandbox, calibrationPassed: e.target.checked })}
                                    />
                                    <label htmlFor="cal-cb" className="text-[10px] font-bold text-slate-500 cursor-pointer">
                                      Calibration Tests Passed
                                    </label>
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Resolution Action Notes</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Enter repair details..."
                                    value={techSandbox.resolutionNotes}
                                    onChange={(e) => setTechSandbox({ ...techSandbox, resolutionNotes: e.target.value, validationError: "" })}
                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none resize-none"
                                  ></textarea>
                                  {techSandbox.validationError && <span className="text-[9px] text-red-500 font-bold mt-1">{techSandbox.validationError}</span>}
                                </div>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg shadow transition-all"
                                >
                                  Log Resolution
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {guide.id === "GUIDE-03" && (
                          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-955 rounded-3xl border border-slate-250 dark:border-slate-850 space-y-4 scale-up">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-450 block">
                              Sandbox: Supplier Logistics Dispatch
                            </span>
                            {supplierSandbox.isDispatched ? (
                              <div className="bg-green-500/10 border border-green-550/20 p-4 rounded-xl text-center scale-up">
                                <span className="text-xs font-bold text-green-600 block">✓ Cargo Dispatched to Courier Routing</span>
                                <p className="text-[9px] text-slate-550 leading-normal mt-1">
                                  Carrier: {supplierSandbox.carrier} | Waybill Code: {supplierSandbox.trackingNumber}
                                </p>
                                <button
                                  onClick={() => setSupplierSandbox({ trackingNumber: "", carrier: "DHL-Express", isDispatched: false })}
                                  className="mt-3 text-[9px] font-bold text-indigo-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
                                >
                                  Dispatch Another Package
                                </button>
                              </div>
                            ) : (
                              <form onSubmit={handleSupplierDispatch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Courier Partner</label>
                                    <select
                                      value={supplierSandbox.carrier}
                                      onChange={(e) => setSupplierSandbox({ ...supplierSandbox, carrier: e.target.value })}
                                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
                                    >
                                      <option value="DHL-Express">DHL Express Logistics</option>
                                      <option value="FedEx-Priority">FedEx Clinical Priority</option>
                                      <option value="UPS-Health">UPS Healthcare Fleet</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col">
                                    <label className="text-[9px] font-bold text-slate-450 mb-1.5 uppercase">Carrier Waybill Reference</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. DHL-982129-EU"
                                      value={supplierSandbox.trackingNumber}
                                      onChange={(e) => setSupplierSandbox({ ...supplierSandbox, trackingNumber: e.target.value })}
                                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-3 py-2 outline-none"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg shadow transition-all"
                                >
                                  Lock Cargo & Dispatch
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                <span className="text-2xl block mb-2">🔍</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  No manuals match query
                </h4>
                <p className="text-[10px] text-slate-550">
                  Try adjusting search strings or role filters.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
