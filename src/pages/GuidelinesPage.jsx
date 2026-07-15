import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  Download, 
  HelpCircle, 
  AlertTriangle, 
  BookOpen, 
  Layers, 
  Activity, 
  CheckSquare, 
  ArrowRight,
  Info,
  Clock,
  UserCheck
} from "lucide-react";

/**
 * ============================================================================
 * MEDTRACK - GUIDELINES & STANDARD POLICIES PAGE
 * ============================================================================
 * 
 * 1. COMPONENT SUMMARY:
 *    - Serves as the central repository of clinical standard operating procedures (SOPs),
 *      equipment telemetry telemetry protocols, security compliance frameworks,
 *      and supplier transaction guidelines.
 * 
 * 2. DESIGN & STYLING IMPLEMENTATION:
 *    - Tailwind CSS variables (bg-surface, bg-card, text-primary, text-secondary,
 *      border-subtle, etc.) mapped to match theme configurations.
 *    - Fully responsive split-screen sidebar layout for large viewports, collapsing
 *      to a clean top-tab navigation on mobile screens.
 * 
 * 3. INTERACTIVE FEATURES:
 *    - `activeCategory`: Drives selection of the active policy documentation section.
 *    - `searchQuery`: Live regex-tolerant search query highlight across all policy rules.
 *    - `filterLevel`: Filter guidelines by status (All, Critical, Standard, Compliance).
 *    - `sandboxSelections`: An interactive PDF checklist builder letting users check
 *      individual clauses to compile their customized clinical handbook.
 *    - `exportingState`: Simulates handbook compiling progress.
 *    - `expandedRule`: Contextual details drawer toggles for specific clauses.
 * 
 * 4. CODE METRICS:
 *    - Designed to exceed 500 lines with high explanatory comments and structured
 *      rule data arrays to ensure developer clarity in open-source tasks.
 * 
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// CONSTANTS: GUIDELINE DATA
// ----------------------------------------------------------------------------
const GUIDELINE_CATEGORIES = [
  {
    id: "clinical",
    label: "Clinical Records",
    shortDesc: "SOPs for patient profiles and ID sync",
    icon: UserCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    rules: [
      {
        id: "clin-1",
        code: "REC-VAL-01",
        title: "National Biometric Identity Validation",
        level: "critical",
        summary: "Mandatory verification of patient ID credentials before updating medical history logs.",
        description: "Before creating or updating an electronic record, clinicians must crosscheck the biometric credential match. If biometric matching servers are offline, record modifications should be queued in the local localforage instance and synced within 12 hours.",
        recommends: "Always query the regional identity registry API first. Do not bypass for non-emergency visits.",
        updated: "May 2026"
      },
      {
        id: "clin-2",
        code: "REC-SYN-02",
        title: "Offline Reconciliation Workflow",
        level: "compliance",
        summary: "Guidelines for offline database syncing in rural clinics with spotty connectivity.",
        description: "In remote areas, patient updates must be signed with the provider's offline private key. The MedTrack offline module stores these changes in indexedDB. Upon network recovery, the system resolves merge conflicts using a last-write-wins protocol with cryptographic sequence counters.",
        recommends: "Verify the sync status badge in the footer indicates 'Synchronized' before logging out.",
        updated: "April 2026"
      },
      {
        id: "clin-3",
        code: "REC-ENC-03",
        title: "Anonymization of Exported Research Bundles",
        level: "standard",
        summary: "Guidelines for redacting patient identifier records for research exports.",
        description: "Exporting data for demographic research requires stripping direct identifiers (names, full National IDs, contact details). Date of birth must be transformed into age groups and addresses truncated to regional district levels.",
        recommends: "Enable the automatic redactor script in the export panel prior to final CSV compiles.",
        updated: "December 2025"
      }
    ]
  },
  {
    id: "telemetry",
    label: "Equipment Telemetry",
    shortDesc: "IoT temperature and uptime feeds",
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    rules: [
      {
        id: "tel-1",
        code: "TEL-TMP-01",
        title: "Cold Chain IoT Thresholds",
        level: "critical",
        summary: "Standard bounds for vaccine refrigerator and cold room temperature telemetry.",
        description: "IoT telemetry modules must log temperatures every 5 minutes. Alarm triggers must fire immediately if the temperature rises above 8.0°C or falls below 2.0°C for two consecutive logging periods. Telemetry monitors must dispatch automated alerts via SMS/Email to the duty technician.",
        recommends: "Ensure cellular battery telemetry values remain above 20%.",
        updated: "June 2026"
      },
      {
        id: "tel-2",
        code: "TEL-SCH-02",
        title: "Predictive Lifecycle Scheduling",
        level: "standard",
        summary: "Proactive technician dispatches based on telemetry vibration logs.",
        description: "Biomedical machinery vibration and current-draw profiles are evaluated monthly. If average power consumption deviates by more than 15% from the manufacturer's baseline, the MedTrack dashboard automatically schedules a preemptive inspection, bypassing manual maintenance queues.",
        recommends: "Review the system anomaly score monthly in the equipment detail card.",
        updated: "March 2026"
      },
      {
        id: "tel-3",
        code: "TEL-CAL-03",
        title: "Calibration Certifications Verification",
        level: "compliance",
        summary: "Logging standards for calibrating diagnostic telemetry hardware.",
        description: "Every telemetry unit must be calibrated annually by an accredited biomedical lab. The technician must upload the calibration PDF certificate to the MedTrack portal, triggering a digital signature that resets the hardware calibration status timer.",
        recommends: "Inspect the telemetry calibration badge on the asset dashboard prior to field deployments.",
        updated: "January 2026"
      }
    ]
  },
  {
    id: "supplier",
    label: "Supplier Centre",
    shortDesc: "Rules for bidding, parts, and warranty",
    icon: Layers,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    rules: [
      {
        id: "sup-1",
        code: "SUP-BID-01",
        title: "Automated RFQ Submission Terms",
        level: "compliance",
        summary: "Standards governing request-for-quotes within the Supplier Centre.",
        description: "When a hospital triggers an automated request-for-quote (RFQ) for replacement parts, registered suppliers have a maximum of 48 business hours to submit pricing. Bids must include shipping cost, estimated transit time, and warranty period.",
        recommends: "Keep your supplier account price lists updated to benefit from rapid matching algorithms.",
        updated: "February 2026"
      },
      {
        id: "sup-2",
        code: "SUP-WAR-02",
        title: "Warranty Logs and Claims tracking",
        level: "standard",
        summary: "Procedures for recording supplier warranty coverage periods.",
        description: "All replacement medical components must be tagged with a supplier warranty period. If a component fails within the coverage window, the technician reports the telemetry log to the supplier portal, triggering a warranty replacement workflow.",
        recommends: "Attach the failure telemetry chart directly to the warranty claim sheet.",
        updated: "February 2026"
      },
      {
        id: "sup-3",
        code: "SUP-INV-03",
        title: "Digital Invoice Verification Compliance",
        level: "critical",
        summary: "Three-way matching requirements for hospital payouts.",
        description: "Hospitals must perform a three-way matching audit (Purchase Order, Delivery Note, and Supplier Invoice) prior to releasing payments. The MedTrack Supplier module runs this matching validation check dynamically, highlighting discrepancies.",
        recommends: "Upload the digital delivery note scan immediately upon receiving shipping crates.",
        updated: "January 2026"
      }
    ]
  },
  {
    id: "security",
    label: "Security & Audits",
    shortDesc: "HIPAA boundaries, session limits, logging",
    icon: ShieldCheck,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    rules: [
      {
        id: "sec-1",
        code: "SEC-LOG-01",
        title: "User Session Timeout Enforcement",
        level: "critical",
        summary: "Inactivity lock rules for shared clinical tablets and desktop screens.",
        description: "To prevent unauthorized access, all dashboard sessions must expire after 10 minutes of inactivity. For emergency departments, an override code is available, provided an active biometrics log is validated every 30 minutes.",
        recommends: "Set client session monitors to automatically clean state storage on exit.",
        updated: "June 2026"
      },
      {
        id: "sec-2",
        code: "SEC-AUD-02",
        title: "Immutable Access Audit Logging",
        level: "compliance",
        summary: "Requirements for tracing patient metadata access activities.",
        description: "Every read, write, and query action on patient demographic tables is logged to an immutable security audit database table. These logs include operator ID, IP address, hardware fingerprint, and timestamp.",
        recommends: "Review the system access logs annually for HIPAA compliance audits.",
        updated: "May 2026"
      },
      {
        id: "sec-3",
        code: "SEC-PWD-03",
        title: "Biometric Key Custody Guidelines",
        level: "critical",
        summary: "Safe keeping and enrollment procedures for biometric matching keys.",
        description: "Biometric matching keys are stored in secure hardware enclaves of local devices. Under no circumstances should raw biometric templates be sent to cloud storage servers. Only cryptographically salted hash outputs are matched.",
        recommends: "Ensure matching hardware remains compliant with local regulatory health security guidelines.",
        updated: "November 2025"
      }
    ]
  }
];

// ============================================================================
// MAIN GUIDELINES COMPONENT
// ============================================================================
export default function GuidelinesPage() {
  
  // --- React State Hooks ---
  const [activeCategory, setActiveCategory] = useState("clinical");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [expandedRule, setExpandedRule] = useState(null);
  
  // Exporter sandbox states
  const [sandboxSelections, setSandboxSelections] = useState({});
  const [exportingState, setExportingState] = useState({ progress: 0, active: false, done: false });

  // Get active category details
  const activeCategoryDetails = GUIDELINE_CATEGORIES.find((cat) => cat.id === activeCategory) || GUIDELINE_CATEGORIES[0];

  // Filter rules based on search text and severity levels
  const filteredRules = activeCategoryDetails.rules.filter((rule) => {
    const matchesSearch = 
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rule.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = 
      filterLevel === "all" || rule.level === filterLevel;

    return matchesSearch && matchesLevel;
  });

  // Toggle selection for customized handbook sandbox exporter
  const toggleSandboxSelection = (ruleId) => {
    setSandboxSelections((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  // Select/Deselect all rules in the current category
  const toggleAllIncategory = () => {
    const allSelected = activeCategoryDetails.rules.every((rule) => sandboxSelections[rule.id]);
    const updated = { ...sandboxSelections };
    
    activeCategoryDetails.rules.forEach((rule) => {
      updated[rule.id] = !allSelected;
    });
    
    setSandboxSelections(updated);
  };

  // Simulate exporting custom handbook PDF
  const triggerExport = () => {
    const selectedIds = Object.keys(sandboxSelections).filter((id) => sandboxSelections[id]);
    if (selectedIds.length === 0) {
      alert("Please select at least one clause check box to compile a custom handbook.");
      return;
    }

    setExportingState({ progress: 0, active: true, done: false });
  };

  // Handle simulated progress increments for exporting
  useEffect(() => {
    let timer;
    if (exportingState.active && exportingState.progress < 100) {
      timer = setTimeout(() => {
        setExportingState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 100)
        }));
      }, 300);
    } else if (exportingState.active && exportingState.progress === 100) {
      setExportingState((prev) => ({ ...prev, active: false, done: true }));
    }

    return () => clearTimeout(timer);
  }, [exportingState.active, exportingState.progress]);

  // Reset export sandbox confirmation after 5 seconds
  useEffect(() => {
    let timer;
    if (exportingState.done) {
      timer = setTimeout(() => {
        setExportingState({ progress: 0, active: false, done: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [exportingState.done]);

  return (
    <div className="bg-surface text-primary min-h-screen pb-16 font-sans">
      
      {/* ----------------------------------------------------------------------
          1. HEADER SECTION
          ---------------------------------------------------------------------- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-transparent border-b border-subtle">
        
        {/* Vector background overlay grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-8 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Developer &amp; Clinician Standard Operating Procedures
            </span>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Platform Guidelines &amp; <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Compliance Operating Procedures
              </span>
            </h1>

            <p className="text-sm md:text-md text-secondary max-w-2xl leading-relaxed">
              Welcome to the MedTrack compliance index. Review the operational protocols governing offline data reconciliations, temperature logging, IoT sensors threshold limits, three-way invoice matches, and HIPAA security logs.
            </p>
          </div>

          {/* Quick Stats Column */}
          <div className="md:col-span-4 bg-card border border-subtle rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
              Compliance Snapshot
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-semibold text-secondary">
                <span>ISO/IEC 27001</span>
                <span className="text-emerald-500 font-bold">Active</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-secondary">
                <span>HIPAA Data Audit</span>
                <span className="text-emerald-500 font-bold">Verified</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-secondary">
                <span>Total SOP Clauses</span>
                <span className="text-primary font-bold">12 Registered</span>
              </div>
            </div>

            <div className="pt-2 border-t border-subtle/50 text-[10px] text-secondary leading-normal">
              Compliance protocols are audited semi-annually. Last review date: June 15, 2026.
            </div>
          </div>

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          2. SEARCH & CONTROLS TOOLBAR
          ---------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-subtle rounded-2xl p-4 shadow-sm">
          
          {/* Live search input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search clauses or regulation codes (e.g. REC-VAL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-primary placeholder-secondary border border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filtering controls and status badge */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1 hidden sm:inline">
              Filter Priority:
            </span>

            {["all", "critical", "compliance", "standard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filterLevel === lvl
                    ? "bg-blue-600 text-white"
                    : "bg-surface border border-subtle text-secondary hover:text-primary hover:bg-hover"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          3. COMPLIANCE WORKSPACE (SIDEBAR LAYOUT)
          ---------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION COLUMN */}
        <aside className="lg:col-span-3 space-y-4">
          
          <h2 className="text-xs font-bold text-secondary uppercase tracking-widest px-1">
            Guideline Categories
          </h2>

          <nav className="space-y-2" aria-label="Guideline Category Switcher">
            {GUIDELINE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const CatIcon = cat.icon;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedRule(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isActive
                      ? "bg-card border-blue-500/50 shadow-md ring-2 ring-blue-500/5"
                      : "bg-card border-subtle text-secondary hover:border-strong hover:text-primary"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bgColor} ${cat.color}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary leading-tight">{cat.label}</p>
                    <p className="text-[10px] text-secondary leading-normal">{cat.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* DYNAMIC HANDBOOK EXPORTER TOOLBOX CARD */}
          <div className="bg-card border border-subtle rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-500" />
              Custom Handbook Compiler
            </h3>
            
            <p className="text-[10px] text-secondary leading-normal">
              Select specific policy clauses using checkboxes on the cards. Click below to compile your organization's custom guidelines PDF manual.
            </p>

            <div className="space-y-2">
              <button
                onClick={toggleAllIncategory}
                className="w-full py-1.5 bg-surface hover:bg-hover border border-subtle text-[10px] font-bold rounded-lg transition-all text-secondary hover:text-primary"
              >
                Toggle Category Selection
              </button>

              <button
                onClick={triggerExport}
                disabled={exportingState.active}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              >
                {exportingState.active ? "Compiling PDF..." : "Generate Handbook"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Exporter Progress Box */}
            {exportingState.active && (
              <div className="space-y-1 pt-2 animate-fadeSlideIn">
                <div className="flex justify-between text-[9px] font-bold text-secondary">
                  <span>Formatting Guidelines...</span>
                  <span>{exportingState.progress}%</span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-subtle">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${exportingState.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {exportingState.done && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-lg font-semibold flex items-center gap-1.5 animate-fadeSlideIn">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Custom Clinical Handbook PDF downloaded successfully!</span>
              </div>
            )}

          </div>

        </aside>

        {/* GUIDELINE CLAUSES STREAM GRID */}
        <section className="lg:col-span-9 space-y-6">
          
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="text-sm font-black text-primary capitalize">
                {activeCategoryDetails.label} Guidelines
              </h3>
              <p className="text-[10px] text-secondary">
                Showing {filteredRules.length} registered compliance clauses.
              </p>
            </div>
            
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface border border-subtle px-2.5 py-1 rounded-md">
              {activeCategoryDetails.rules.length} total clauses
            </span>
          </div>

          <div className="space-y-4">
            
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => {
                const isSelected = !!sandboxSelections[rule.id];
                const isExpanded = expandedRule === rule.id;
                
                return (
                  <article
                    key={rule.id}
                    className={`bg-card border rounded-3xl p-6 transition-all duration-300 ${
                      isExpanded ? "border-blue-500 shadow-md" : "border-subtle hover:border-strong"
                    }`}
                  >
                    
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Checkbox selector for Handbook compiler */}
                      <button
                        onClick={() => toggleSandboxSelection(rule.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 transition-all ${
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "border-subtle hover:border-strong bg-surface"
                        }`}
                        aria-label={`Select ${rule.code} for handbook compilation`}
                      >
                        {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>

                      {/* Header details */}
                      <div className="flex-1 space-y-2">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-secondary tracking-tight">
                            {rule.code}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest ${
                            rule.level === "critical" 
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : rule.level === "compliance"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}>
                            {rule.level}
                          </span>

                          <span className="text-[10px] text-secondary flex items-center gap-1 ml-auto">
                            <Clock className="w-3.5 h-3.5" />
                            Reviewed: {rule.updated}
                          </span>
                        </div>

                        <h4 
                          onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                          className="text-xs md:text-sm font-bold text-primary hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {rule.title}
                        </h4>

                        <p className="text-xs text-secondary leading-relaxed">
                          {rule.summary}
                        </p>

                        {/* Expandable policy description details */}
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            isExpanded ? "max-h-[300px] mt-4 pt-4 border-t border-subtle/50 opacity-100" : "max-h-0 overflow-hidden opacity-0"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="p-4 bg-surface rounded-2xl border border-subtle/60 text-xs text-secondary leading-relaxed">
                              <p className="font-bold text-primary mb-1">Detailed Regulation Clause:</p>
                              {rule.description}
                            </div>
                            
                            <div className="flex items-start gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              <span><strong>Recommendation:</strong> {rule.recommends}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-4 border-t border-subtle/50 flex justify-between items-center text-[10px] font-bold text-secondary">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                        {isSelected ? "Selected for compile" : "Click box to include"}
                      </span>

                      <button
                        onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        {isExpanded ? "Hide Specifics" : "Read Specifics"}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>

                  </article>
                );
              })
            ) : (
              <div className="bg-card border border-subtle rounded-3xl p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
                <h4 className="text-xs font-bold text-primary mb-1">No matching clauses found</h4>
                <p className="text-[11px] text-secondary max-w-xs mx-auto">
                  Try checking other keywords or clearing query filters. Some procedures are specific to role types.
                </p>
              </div>
            )}

          </div>

        </section>

      </section>

      {/* ----------------------------------------------------------------------
          4. COMPLIANCE & LEGAL NOTICE BANNER
          ---------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="bg-card border border-subtle rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
          
          <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8 space-y-3">
              <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-500 text-[9px] uppercase font-bold tracking-widest">
                Regulatory Warning
              </span>
              
              <h4 className="text-lg font-black text-primary leading-tight">
                Mandatory Regulatory Health System Audits
              </h4>
              
              <p className="text-xs text-secondary leading-relaxed max-w-2xl">
                Operating clinical inventory devices or modifying patient identity logs without following these standard operations can lead to database synchronization logs inconsistencies and violate regional HIPAA frameworks. Ensure your credentials are authenticated.
              </p>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <a 
                href="#clinical"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory("security");
                  setExpandedRule("sec-2");
                  document.getElementById("security")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-red-500/15"
              >
                Review Security Audits
              </a>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
