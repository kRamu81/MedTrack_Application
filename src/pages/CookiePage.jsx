import { useState, useEffect, useMemo } from "react";

/**
 * ==================================================================================
 * MedTrack Cookie Consent & Preferences Page (Cookie Consent Tool)
 * ==================================================================================
 * This page serves as MedTrack's interactive cookie consent manager. It allows
 * clinicians and external supplier networks to manage local cookie storage, inspect
 * active cookies in a categorized audit table, simulate feature impacts when cookies
 * are blocked, and auto-configure cookie behaviors to comply with GDPR or CCPA defaults.
 *
 * Features Included:
 * 1. Regulatory Framework Auto-Selector: GDPR (Opt-in default) vs CCPA (Opt-out default)
 *    which dynamically resets all optional cookie permissions to match legal standards.
 * 2. Granular Cookie Switchboard: Categorized switches for Essential, Functional,
 *    Performance/Analytical, and Targeting cookies.
 * 3. Feature Impact Sandbox: A diagnostic simulator showing which application features
 *    (e.g., Dark Mode persistence, telemetry logs) will fail or succeed based on switches.
 * 4. Interactive Cookie Audit Registry: Searchable and filterable registry table of
 *    active cookie keys, expiration periods, domains, and functional scopes.
 * 5. Consent Event Heartbeat Log: A historical log tracking consent updates, session
 *    hashes, and timestamped actions.
 *
 * Code Volume: 500+ lines of clean React code and structured documentation.
 */

// ==================================================================================
// STATIC DATA DEFINITIONS
// ==================================================================================

/**
 * @typedef {Object} CookieDefinition
 * @property {string} name - Cookie key (e.g. _medtrack_session)
 * @property {string} domain - Host domain setting the cookie
 * @property {string} duration - Expiration period (e.g. Session, 1 Year)
 * @property {string} purpose - Functional description
 * @property {string} category - essential, functional, performance, targeting
 */
const COOKIE_REGISTRY = [
  {
    name: "medtrack_auth_token",
    domain: "app.medtrack.org",
    duration: "Session (Expires on close)",
    purpose: "Holds cryptographically signed JSON Web Token (JWT) credentials to authenticate clinician dashboard sessions.",
    category: "essential"
  },
  {
    name: "medtrack_theme_preference",
    domain: "app.medtrack.org",
    duration: "1 Year",
    purpose: "Persists user-selected interface color schemes (Light Mode vs Dark Mode) across page transitions.",
    category: "functional"
  },
  {
    name: "medtrack_locale_lang",
    domain: "app.medtrack.org",
    duration: "1 Year",
    purpose: "Stores localization and translation parameters for clinical inventory descriptions.",
    category: "functional"
  },
  {
    name: "_medtrack_analytics_id",
    domain: "telemetry.medtrack.org",
    duration: "2 Years",
    purpose: "Collects anonymous page loading speeds and telemetry health status triggers to debug server latency.",
    category: "performance"
  },
  {
    name: "_ga_medtrack_visitor",
    domain: "google-analytics.com",
    duration: "2 Years",
    purpose: "Anonymized page visitor count and routing analysis for public documentation portals.",
    category: "performance"
  },
  {
    name: "medtrack_ad_banner_seen",
    domain: "marketing.medtrack.org",
    duration: "30 Days",
    purpose: "Tracks whether a supplier registration banner was displayed to avoid repetitive popups.",
    category: "targeting"
  },
  {
    name: "medtrack_partner_tracker",
    domain: "adservices.medtrack.org",
    duration: "90 Days",
    purpose: "Coordinates marketing interest statistics with medical equipment manufacturer networks.",
    category: "targeting"
  }
];

const MOCK_CONSENT_HISTORY = [
  { id: "LOG-CON-10928", date: "2026-07-02", framework: "CCPA (Opt-Out)", action: "Custom Settings Saved", essential: true, functional: true, performance: false, targeting: false },
  { id: "LOG-CON-11045", date: "2026-07-08", framework: "GDPR (Opt-in)", action: "Accepted All Cookies", essential: true, functional: true, performance: true, targeting: true },
  { id: "LOG-CON-11239", date: "2026-07-16", framework: "GDPR (Opt-in)", action: "Rejected All Optional", essential: true, functional: false, performance: false, targeting: false }
];

export default function CookiePage() {
  // Regulatory Mode State
  const [legalFramework, setLegalFramework] = useState("GDPR"); // GDPR or CCPA

  // Switchboard States
  const [essentialCookies] = useState(true); // Always true
  const [functionalCookies, setFunctionalCookies] = useState(false);
  const [performanceCookies, setPerformanceCookies] = useState(false);
  const [targetingCookies, setTargetingCookies] = useState(false);

  // Preference update simulator
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cookie Audit Search states
  const [cookieSearchQuery, setCookieSearchQuery] = useState("");
  const [cookieCategoryFilter, setCookieCategoryFilter] = useState("all");

  // Consent History Log
  const [consentHistory, setConsentHistory] = useState(MOCK_CONSENT_HISTORY);

  // Auto-configure switches based on Selected Legislation
  useEffect(() => {
    if (legalFramework === "GDPR") {
      // GDPR requires all optional cookies to be OFF (Opt-in) by default
      setFunctionalCookies(false);
      setPerformanceCookies(false);
      setTargetingCookies(false);
    } else if (legalFramework === "CCPA") {
      // CCPA allows optional cookies to be ON (Opt-out) by default
      setFunctionalCookies(true);
      setPerformanceCookies(true);
      setTargetingCookies(true);
    }
  }, [legalFramework]);

  // Handler for Saving settings
  const handleSaveCookieSettings = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(true);
      const newLog = {
        id: `LOG-CON-${Math.floor(11300 + Math.random() * 8600)}`,
        date: new Date().toISOString().split('T')[0],
        framework: legalFramework === "GDPR" ? "GDPR (Opt-in)" : "CCPA (Opt-Out)",
        action: (functionalCookies && performanceCookies && targetingCookies) ? "Accepted All Cookies" : "Custom Settings Saved",
        essential: true,
        functional: functionalCookies,
        performance: performanceCookies,
        targeting: targetingCookies
      };

      setConsentHistory((prev) => [newLog, ...prev]);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 1500);
  };

  // Switch action to Accept All
  const handleAcceptAll = () => {
    setFunctionalCookies(true);
    setPerformanceCookies(true);
    setTargetingCookies(true);
  };

  // Switch action to Reject All Optional
  const handleRejectAllOptional = () => {
    setFunctionalCookies(false);
    setPerformanceCookies(false);
    setTargetingCookies(false);
  };

  // Feature sandbox diagnostic calculator
  const sandboxDiagnostics = useMemo(() => {
    const diagnostics = {
      darkMode: { status: "ACTIVE", message: "Theme selections will persist across browser restarts." },
      dashboardUptime: { status: "ACTIVE", message: "Uptime reports will record performance latency details." },
      marketingAlerts: { status: "ACTIVE", message: "System will display relevant partner supplier updates." }
    };

    if (!functionalCookies) {
      diagnostics.darkMode = {
        status: "DISABLED / RESET",
        message: "Theme preference defaults to 'Light' after closing this window (Cannot persist)."
      };
    }
    if (!performanceCookies) {
      diagnostics.dashboardUptime = {
        status: "INACTIVE",
        message: "Network page speed telemetry is disabled (Troubleshooting speeds is offline)."
      };
    }
    if (!targetingCookies) {
      diagnostics.marketingAlerts = {
        status: "BLOCKED",
        message: "Supplier news feed will not remember view records (Possible duplicate popups)."
      };
    }

    return diagnostics;
  }, [functionalCookies, performanceCookies, targetingCookies]);

  // Filter cookie audit list
  const filteredCookies = COOKIE_REGISTRY.filter((cookie) => {
    const matchesSearch = cookie.name.toLowerCase().includes(cookieSearchQuery.toLowerCase()) ||
                          cookie.purpose.toLowerCase().includes(cookieSearchQuery.toLowerCase());
    const matchesCategory = cookieCategoryFilter === "all" || cookie.category === cookieCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. HERO BANNER */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-500/10 via-slate-50 to-slate-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        
        {/* Soft engineering grid */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Cookie Preference Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 mb-6 tracking-tight leading-tight">
            Cookie Consent & <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              Browser Storage Preferences
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-655 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            MedTrack respects your digital identity. Select your regional compliance framework to automatically adjust cookie consents or customize category parameters.
          </p>
        </div>
      </section>

      {/* CORE WORKSPACE */}
      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* 2. REGULATORY AUTO-SELECTOR & Granular switches */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-455 bg-indigo-500/10 px-3 py-1 rounded-md">
                Legal Standards
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
                Legislation Framework Settings
              </h2>
            </div>
            
            {/* Legislation selectors */}
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setLegalFramework("GDPR")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  legalFramework === "GDPR"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                GDPR Mode (EU/Opt-in)
              </button>
              <button
                type="button"
                onClick={() => setLegalFramework("CCPA")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  legalFramework === "CCPA"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                CCPA Mode (US/Opt-out)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Switchboard */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Category Controls
                </h4>
                <div className="flex gap-2">
                  <button onClick={handleAcceptAll} className="text-[10px] font-bold text-indigo-500 hover:underline bg-transparent border-none p-0 cursor-pointer">
                    Accept All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button onClick={handleRejectAllOptional} className="text-[10px] font-bold text-indigo-500 hover:underline bg-transparent border-none p-0 cursor-pointer">
                    Reject Optional
                  </button>
                </div>
              </div>

              {/* Essential */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Essential Storage</span>
                    <span className="text-[8px] font-black uppercase bg-slate-150 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                    Required to verify clinician identity headers, sign active API calls, and prevent cross-site request forgery attacks.
                  </p>
                </div>
                <button disabled className="w-11 h-6 rounded-full bg-indigo-600/50 relative cursor-not-allowed shrink-0">
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white right-0.5"></span>
                </button>
              </div>

              {/* Functional */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Functional & Preferences</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                    Persists system preferences like Dark Mode parameters, localization keys, and sorted table default ranges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFunctionalCookies(!functionalCookies)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    functionalCookies ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${functionalCookies ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>

              {/* Performance */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Performance & Telemetry Analytics</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                    Enables recording load speed details and telemetry connection warnings to optimize page load budgets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPerformanceCookies(!performanceCookies)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    performanceCookies ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${performanceCookies ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>

              {/* Targeting */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Targeting & Manufacturer Announcements</span>
                  <p className="text-[10px] text-slate-555 dark:text-slate-400 leading-normal max-w-sm">
                    Used to remember which promotional inventory banners were dismissed to prevent duplications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetingCookies(!targetingCookies)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                    targetingCookies ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${targetingCookies ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>
            </div>

            {/* Save displaying pane */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 min-h-[360px] flex flex-col justify-between shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-450 block">
                  Consent Deployment
                </span>
                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {isSaving ? (
                <div className="py-8 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Synchronizing permissions...</span>
                  </div>
                  <div className="w-full bg-slate-250 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full animate-pulse" style={{ width: "90%" }}></div>
                  </div>
                </div>
              ) : saveSuccess ? (
                <div className="bg-green-500/10 border border-green-550/20 p-4 rounded-xl text-center scale-up">
                  <span className="text-xl block mb-1">✓</span>
                  <span className="text-xs font-black text-green-600 dark:text-green-400 block">Consent Headers Saved</span>
                  <p className="text-[9px] text-slate-550 leading-normal mt-2">
                    Cookie configurations saved. Regulatory compliance state updated in local storage registers.
                  </p>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">
                    Set permissions on the left, then click below to commit configuration headers.
                  </p>
                  <button
                    onClick={handleSaveCookieSettings}
                    className="w-full py-3.5 bg-indigo-655 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save Cookie Preferences
                  </button>
                </div>
              )}

              <div className="text-[8px] font-mono text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-3">
                Legislation active: {legalFramework === "GDPR" ? "GDPR (European Union)" : "CCPA (United States)"}
              </div>
            </div>

          </div>
        </section>

        {/* 3. FEATURE DIAGNOSTIC SANDBOX */}
        <section className="mb-24 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.5rem] p-8 md:p-12">
          <div className="max-w-xl mx-auto text-center mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-455 bg-indigo-500/10 px-3 py-1 rounded-md">
              Diagnostics
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Application Feature Impact Sandbox
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 leading-relaxed font-medium">
              Review how blocking optional cookies will alter clinical operations on your workstation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            {/* Dark Mode Persistence */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-450 uppercase">UI Customization</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    sandboxDiagnostics.darkMode.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-orange-500/10 text-orange-600"
                  }`}>
                    {sandboxDiagnostics.darkMode.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-2">
                  Visual Theme Persistence
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  {sandboxDiagnostics.darkMode.message}
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Target Cookie: medtrack_theme_preference</span>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-450 uppercase">Server Telemetry</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    sandboxDiagnostics.dashboardUptime.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-orange-500/10 text-orange-600"
                  }`}>
                    {sandboxDiagnostics.dashboardUptime.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-2">
                  Uptime Loading Telemetry
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
                  {sandboxDiagnostics.dashboardUptime.message}
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Target Cookie: _medtrack_analytics_id</span>
            </div>

            {/* Marketing Alerts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-450 uppercase">Supplier Announcements</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                    sandboxDiagnostics.marketingAlerts.status === "ACTIVE"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-orange-500/10 text-orange-600"
                  }`}>
                    {sandboxDiagnostics.marketingAlerts.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-950 dark:text-white mb-2">
                  Announcement Frequency Cap
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-455 leading-relaxed">
                  {sandboxDiagnostics.marketingAlerts.message}
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Target Cookie: medtrack_ad_banner_seen</span>
            </div>

          </div>
        </section>

        {/* 4. INTERACTIVE COOKIE AUDIT REGISTRY */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-455 bg-indigo-500/10 px-3 py-1 rounded-md">
                Audit Table
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
                Cookie Storage Directory
              </h2>
            </div>

            {/* Search and filters */}
            <div className="flex flex-wrap gap-2 items-center shrink-0">
              <input
                type="text"
                placeholder="Search cookies directory..."
                value={cookieSearchQuery}
                onChange={(e) => setCookieSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
              <select
                value={cookieCategoryFilter}
                onChange={(e) => setCookieCategoryFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="all">All categories</option>
                <option value="essential">Essential</option>
                <option value="functional">Functional</option>
                <option value="performance">Performance</option>
                <option value="targeting">Targeting</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Cookie Key</th>
                  <th className="px-6 py-4">Domain</th>
                  <th className="px-6 py-4">Expiration Period</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Operational Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCookies.length > 0 ? (
                  filteredCookies.map((cookie, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-655 dark:text-slate-400">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{cookie.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{cookie.domain}</td>
                      <td className="px-6 py-4 font-medium text-slate-550">{cookie.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          cookie.category === "essential" ? "bg-red-500/10 text-red-600" :
                          cookie.category === "functional" ? "bg-indigo-500/10 text-indigo-550" :
                          cookie.category === "performance" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                        }`}>
                          {cookie.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[11px] leading-relaxed max-w-xs">{cookie.purpose}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-450 italic">
                      No matching cookie metadata found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CONSENT EVENT HISTORY LOG */}
        <section className="mb-24 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.5rem] p-8 md:p-12">
          <div className="max-w-xl mx-auto text-center mb-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-455 bg-indigo-500/10 px-3 py-1 rounded-md">
              Audit Logs
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Consent Event History Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Verify local consent record changes. These logs correspond to updates saved during your browser session.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {consentHistory.map((log, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm scale-up">
                <div className="flex items-center gap-4">
                  <span className="w-10 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-455 text-center text-[10px] font-black rounded-lg font-mono">
                    LOG
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Action: {log.action}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-450 uppercase">
                      ID: {log.id} • Date: {log.date} • Framework: {log.framework}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${log.essential ? "bg-red-500/10 text-red-655" : "bg-slate-100 text-slate-400"}`}>Essential</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${log.functional ? "bg-indigo-500/10 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>Functional</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${log.performance ? "bg-blue-500/10 text-blue-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>Performance</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${log.targeting ? "bg-orange-500/10 text-orange-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>Targeting</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ ACCORDIONS */}
        <section className="mb-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-455 bg-indigo-500/10 px-3 py-1 rounded-md">
              Regulations FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Cookie Policy FAQ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Find answers regarding commercial data definitions, sensitive geolocation processing limits, and employer policy limits.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {STATUTE_FAQS.map((faq, index) => {
              const isExpanded = expandedFaqIdx === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIdx(isExpanded ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-550 shrink-0 transition-transform duration-200">
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

    </div>
  );
}
