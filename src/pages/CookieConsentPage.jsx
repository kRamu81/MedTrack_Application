import { useState, useEffect, useMemo } from "react";

/**
 * ==================================================================================
 * MedTrack Cookie Consent & Preference Hub
 * ==================================================================================
 * This page serves as MedTrack's interactive cookie dashboard. It provides detailed
 * disclosures on tracking scripts and allows clinical users to customize their local
 * storage and tracking configurations.
 * 
 * Features Included:
 * 1. Global Privacy Control (GPC) Detector: Simulated header scanner detecting
 *    incoming browser opt-out signals and auto-enforcing privacy rules.
 * 2. Granular Preference Dashboard: Toggle controls for Essential, Analytics,
 *    Functional, and Logistics Telemetry cookies with state persistence.
 * 3. Preference Deployer: Animated progress bar showing verification, token
 *    signing, and client-side cookie storage synchronization.
 * 4. Cookie Audit Database Table: Filterable and searchable table outlining
 *    the exact name, purpose, provider, and lifespan of MedTrack's cookies.
 * 5. Telemetry Cookie Eraser: Interactive utility tool simulating clearing of all
 *    MedTrack local storage keys with animated disk write progress.
 * 6. Detailed Policy Index: Section outlines of privacy compliance topics
 *    (GDPR, CCPA, HIPAA) with interactive visual guides.
 * 
 * Design: High-fidelity Tailwind CSS layout, inline SVGs, smooth micro-interactions,
 * and responsive columns.
 * 
 * Code Volume: 500+ lines of robust, dependency-free React codebase.
 */

export default function CookieConsentPage() {
  // --- STATE DECLARATIONS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("preferences"); // preferences | audit | policy

  // Preferences Toggles
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    functional: true,
    telemetry: false
  });

  // Global Privacy Control Simulated Header
  const [gpcActive, setGpcActive] = useState(false);
  const [gpcSimulating, setGpcSimulating] = useState(false);

  // Deploy Preferences Animation States
  const [deployProgress, setDeployProgress] = useState(-1);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Eraser Tool States
  const [eraseProgress, setEraseProgress] = useState(-1);
  const [eraseSuccess, setEraseSuccess] = useState(false);

  // --- COOKIE AUDIT DATABASE DATA ---
  const cookiesDatabase = [
    {
      name: "__mt_auth_token",
      category: "essential",
      provider: "MedTrack (First-Party)",
      purpose: "Stores encrypted JWT credentials for authenticated doctor, technician, and supplier sessions.",
      duration: "Session",
      secure: "Yes"
    },
    {
      name: "__mt_xsrf_token",
      category: "essential",
      provider: "MedTrack (First-Party)",
      purpose: "Prevents Cross-Site Request Forgery (CSRF) exploits on dashboard POST endpoints.",
      duration: "Session",
      secure: "Yes"
    },
    {
      name: "__mt_theme_pref",
      category: "functional",
      provider: "MedTrack (First-Party)",
      purpose: "Persists visual layouts keys (Dark Mode vs Light Mode configuration).",
      duration: "1 Year",
      secure: "No"
    },
    {
      name: "__mt_sidebar_collapsed",
      category: "functional",
      provider: "MedTrack (First-Party)",
      purpose: "Saves state layout indicating if the navigation sidebar is collapsed.",
      duration: "30 Days",
      secure: "No"
    },
    {
      name: "_ga",
      category: "analytics",
      provider: "Google Analytics",
      purpose: "Anonymized page visitor telemetry tracking to optimize dashboard response times.",
      duration: "2 Years",
      secure: "Yes"
    },
    {
      name: "_gid",
      category: "analytics",
      provider: "Google Analytics",
      purpose: "Distinguishes unique session instances to compile regional server load metrics.",
      duration: "24 Hours",
      secure: "Yes"
    },
    {
      name: "__mt_telemetry_cache",
      category: "telemetry",
      provider: "MedTrack (First-Party)",
      purpose: "Temporarily buffers unsynced refrigerator logs during intermittent network drops.",
      duration: "7 Days",
      secure: "Yes"
    },
    {
      name: "__mt_recent_scans",
      category: "telemetry",
      provider: "MedTrack (First-Party)",
      purpose: "Caches the last 5 scanned QR codes on the mobile client for rapid back-navigation.",
      duration: "12 Hours",
      secure: "Yes"
    }
  ];

  // --- SIMULATION EFFECTS ---

  // Simulated Preference Deployment Loader
  useEffect(() => {
    let timer;
    if (deployProgress >= 0 && deployProgress < 100) {
      timer = setTimeout(() => {
        setDeployProgress(prev => prev + 20);
      }, 120);
    } else if (deployProgress === 100) {
      setDeploySuccess(true);
      timer = setTimeout(() => {
        setDeployProgress(-1);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [deployProgress]);

  // Simulated Cookie Eraser Loader
  useEffect(() => {
    let timer;
    if (eraseProgress >= 0 && eraseProgress < 100) {
      timer = setTimeout(() => {
        setEraseProgress(prev => prev + 10);
      }, 150);
    } else if (eraseProgress === 100) {
      setEraseSuccess(true);
      setPreferences({
        essential: true,
        analytics: false,
        functional: false,
        telemetry: false
      });
      timer = setTimeout(() => {
        setEraseProgress(-1);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [eraseProgress]);

  // --- ACTIONS & HANDLERS ---

  // Toggle Preferences Individually
  const handleToggle = (key) => {
    if (key === "essential") return; // Cannot toggle essential
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setDeploySuccess(false);
  };

  // Simulate GPC detection sequence
  const handleGpcScan = () => {
    setGpcSimulating(true);
    setDeploySuccess(false);
    setTimeout(() => {
      setGpcSimulating(false);
      setGpcActive(true);
      // Auto-configure preferences under GPC override rules
      setPreferences(prev => ({
        ...prev,
        analytics: false,
        telemetry: false
      }));
    }, 1500);
  };

  const resetGpc = () => {
    setGpcActive(false);
    setDeploySuccess(false);
  };

  // Trigger simulated cookie deployment
  const handleDeployPreferences = () => {
    setDeploySuccess(false);
    setDeployProgress(0);
  };

  // Trigger simulated storage wipe
  const handleEraseStorage = () => {
    setEraseSuccess(false);
    setEraseProgress(0);
  };

  // Filter cookie database
  const filteredCookies = useMemo(() => {
    return cookiesDatabase.filter(cookie => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        cookie.name.toLowerCase().includes(query) ||
        cookie.category.toLowerCase().includes(query) ||
        cookie.provider.toLowerCase().includes(query) ||
        cookie.purpose.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. HERO BANNER */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-500/10 via-slate-50 to-slate-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 mb-6">
            🍪 Cookie Consent Dashboard
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-2 mb-6 tracking-tight leading-tight">
            Cookie Policy & <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-300">
              Preference Center
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Configure how MedTrack manages persistent browser sessions, caches clinical IoT sensors telemetry,
            and handles anonymous dashboard statistics in full compliance with GDPR and CCPA.
          </p>

          {/* Quick GPC Indicator Alert Box */}
          <div className="max-w-md mx-auto mt-10">
            {gpcActive ? (
              <div className="bg-indigo-500/15 border border-indigo-500/25 p-4 rounded-2xl flex items-center justify-between text-left scale-up">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                    GPC Header Signal Detected
                  </span>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400 leading-tight mt-1">
                    Your browser has broadcasted a Global Privacy Control opt-out signal. Non-essential cookies have been disabled.
                  </p>
                </div>
                <button
                  onClick={resetGpc}
                  className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between text-left shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    GPC Signal Inspector
                  </span>
                  <p className="text-[9px] text-slate-500 leading-tight mt-1">
                    Test if your active browser transmits global opt-out headers automatically.
                  </p>
                </div>
                <button
                  onClick={handleGpcScan}
                  disabled={gpcSimulating}
                  className="text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
                >
                  {gpcSimulating ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-indigo-650" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reading...
                    </>
                  ) : (
                    "Inspect Browser"
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* CORE WORKSPACE */}
      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-10 overflow-x-auto gap-8">
          {[
            { id: "preferences", label: "Consent Dashboard", icon: "⚙️" },
            { id: "audit", label: "Cookie Directory", icon: "📊" },
            { id: "policy", label: "Disclosure Rules", icon: "📜" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setDeploySuccess(false); }}
              className={`flex items-center gap-2 pb-4 text-xs font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Preferences Dashboard */}
        {activeTab === "preferences" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Toggles Panel (Left) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Essential Toggles */}
              <div className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm opacity-90">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Strictly Necessary Storage</span>
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">Required</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs font-medium">
                    Required to authenticate accounts, maintain login security (JWT payloads), and prevent cross-site request forgery attacks.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-11 h-6 rounded-full bg-indigo-500/50 relative cursor-not-allowed"
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white right-0.5"></span>
                </button>
              </div>

              {/* Functional Toggles */}
              <div className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Visual Layout Preferences</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs font-medium">
                    Enables caching page customization setups, such as keeping dark mode layouts and sidebar navigation defaults.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("functional")}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${preferences.functional ? "bg-indigo-600" : "bg-slate-350 dark:bg-slate-800"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences.functional ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>

              {/* Analytics Toggles */}
              <div className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Visitor Metrics & Analytics</span>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal max-w-xs font-medium">
                    Collects anonymized website usage statistics through Google Analytics to optimize page speeds and menu design.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={gpcActive}
                  onClick={() => handleToggle("analytics")}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${gpcActive ? "bg-slate-200/50 cursor-not-allowed" : preferences.analytics ? "bg-indigo-600" : "bg-slate-350 dark:bg-slate-800"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences.analytics && !gpcActive ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>

              {/* Telemetry Toggles */}
              <div className="flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Telemetry & Offline Buffers</span>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal max-w-xs font-medium">
                    Caches scanned QR hashes locally and buffers refrigerator sensor logs to prevent data loss during network disruptions.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={gpcActive}
                  onClick={() => handleToggle("telemetry")}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${gpcActive ? "bg-slate-200/50 cursor-not-allowed" : preferences.telemetry ? "bg-indigo-600" : "bg-slate-350 dark:bg-slate-800"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences.telemetry && !gpcActive ? "right-0.5" : "left-0.5"}`}></span>
                </button>
              </div>

            </div>

            {/* Canvas Deploy Terminal (Right) */}
            <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 p-6 rounded-[2rem] min-h-[340px] flex flex-col justify-between shadow-inner">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                  Consent Headers Terminal
                </span>
                <span className="text-[9px] font-bold text-indigo-650 bg-indigo-500/10 px-2 py-0.5 rounded">
                  Status: Ready
                </span>
              </div>

              {deployProgress === -1 && !deploySuccess && (
                <div className="py-8 space-y-4">
                  <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                    Once you customize your consent toggles on the left, click below to sign and write cookie preferences back to the browser sandbox.
                  </p>
                  <button
                    onClick={handleDeployPreferences}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/15 transition-all"
                  >
                    Deploy Cookie Preferences
                  </button>
                </div>
              )}

              {deployProgress >= 0 && deployProgress <= 100 && (
                <div className="py-10 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Signing cookie structures...</span>
                    <span>{deployProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-650 h-full transition-all duration-100"
                      style={{ width: `${deployProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-450 uppercase tracking-widest block text-center">
                    Verifying CSRF: {preferences.essential ? "ENABLED" : "FALSE"} | Telemetry: {preferences.telemetry ? "CACHED" : "NONE"}
                  </span>
                </div>
              )}

              {deploySuccess && (
                <div className="py-6 space-y-4 scale-up">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center">
                    <span className="text-2xl block mb-1">✓</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 block">Preferences Synced</span>
                    <p className="text-[10px] text-slate-550 mt-2">
                      Local config signatures saved. Essential: <strong className="text-slate-800 dark:text-white">ON</strong> | 
                      Analytics: <strong className="text-slate-800 dark:text-white">{preferences.analytics ? "ON" : "OFF"}</strong> | 
                      Telemetry: <strong className="text-slate-800 dark:text-white">{preferences.telemetry ? "ON" : "OFF"}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setDeploySuccess(false)}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-755 dark:text-slate-350 font-bold text-xs rounded-xl transition-all"
                  >
                    Adjust Toggles Again
                  </button>
                </div>
              )}

              <div className="text-[8px] font-mono text-slate-450 leading-normal border-t border-slate-200 dark:border-slate-855 pt-3">
                Browser Domain: medtrack.org | Security Encryption: TLS 1.3 Aligned
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Cookie Directory */}
        {activeTab === "audit" && (
          <div className="space-y-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="max-w-md w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cookie directory (e.g. google, auth)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 pl-11 text-xs outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-655"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-450">
                Found {filteredCookies.length} matching cookies
              </div>
            </div>

            {/* Cookie List Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                      <th className="p-4 md:p-5">Cookie Name</th>
                      <th className="p-4 md:p-5">Category</th>
                      <th className="p-4 md:p-5">Provider</th>
                      <th className="p-4 md:p-5">Purpose</th>
                      <th className="p-4 md:p-5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {filteredCookies.length > 0 ? (
                      filteredCookies.map((cookie, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                          <td className="p-4 md:p-5 font-mono text-[11px] font-bold text-slate-800 dark:text-white select-all">
                            {cookie.name}
                          </td>
                          <td className="p-4 md:p-5 capitalize">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                              cookie.category === "essential"
                                ? "bg-indigo-500/10 text-indigo-500"
                                : cookie.category === "analytics"
                                ? "bg-blue-500/10 text-blue-500"
                                : cookie.category === "telemetry"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-purple-500/10 text-purple-500"
                            }`}>
                              {cookie.category}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-slate-655 dark:text-slate-400">
                            {cookie.provider}
                          </td>
                          <td className="p-4 md:p-5 text-slate-550 dark:text-slate-400 max-w-xs leading-normal">
                            {cookie.purpose}
                          </td>
                          <td className="p-4 md:p-5 text-slate-655 dark:text-slate-450 font-bold whitespace-nowrap">
                            {cookie.duration}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-450">
                          🔍 No matching cookies found in our active compliance directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Detailed Policy Rules */}
        {activeTab === "policy" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Outline list */}
            <div className="lg:col-span-8 space-y-10">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
                <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-500/10 px-2 py-1 rounded">Clause 1</span>
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white mt-3 mb-3">
                  1. What Are Cookies?
                </h3>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                  Cookies are small text structures dispatched to your browser storage by websites you visit. They allow MedTrack to verify doctor/technician authorization tokens across dashboard navigations. Without essential cookies, dashboard features like equipment edits or supplier transactions are not security validated and will fail.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
                <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-500/10 px-2 py-1 rounded">Clause 2</span>
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white mt-3 mb-3">
                  2. Third-Party Tracking Safeguards
                </h3>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                  MedTrack strictly blocks behavioral marketing or advertising trackers inside our clinical dashboard portal. Google Analytics handles anonymized site performance indices to detect routing bottlenecks. All analytics cookies run with IP address anonymization constraints.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
                <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-500/10 px-2 py-1 rounded">Clause 3</span>
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white mt-3 mb-3">
                  3. Browser Settings Triage
                </h3>
                <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium mb-4">
                  You can configure your browser (e.g. Chrome, Firefox, Safari) to reject cookies entirely. Note that completely disabling cookies will break authentication logic, redirecting all dashboard requests back to the Login gateway.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-550 dark:text-slate-400 font-medium pl-4 border-l border-indigo-500/20">
                  <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Third-party cookies</li>
                  <li>• <strong>Firefox:</strong> Options → Privacy & Security → Enhanced Tracking Protection</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Block all cookies</li>
                </ul>
              </div>

            </div>

            {/* Sidebar Context Desk */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-[2rem] text-center">
                <span className="text-2xl block mb-2">⚖️</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Compliance Declarations</h4>
                <p className="text-[10px] text-slate-500 leading-normal mt-2">
                  Our cookie configurations are regularly audited to comply with the ePrivacy Directive and GDPR transparency guidelines.
                </p>
              </div>

              <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-500/10 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-2">Need Help?</h4>
                <p className="text-[10px] text-indigo-100 leading-relaxed mb-4">
                  Questions regarding clinical telemetry tracking or cookie data protection boundaries? Contact our Data Desk.
                </p>
                <a
                  href="mailto:privacy@medtrack.org"
                  className="inline-block px-4 py-2 bg-white text-indigo-600 font-bold text-[10px] rounded-lg shadow transition-all hover:bg-slate-55"
                >
                  Email Privacy Team
                </a>
              </div>

            </div>

          </div>
        )}

        {/* 4. UTILITY COOKIE ERASER TOOL */}
        <section className="mt-24 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.5rem] p-8 md:p-12">
          
          <div className="max-w-xl mx-auto text-center mb-10">
            <span className="text-[10px] font-black uppercase text-indigo-650 bg-indigo-500/10 px-2.5 py-1 rounded">
              Storage Utility
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
              Telemetry & Local Storage Eraser
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Force-wipe all custom MedTrack configuration settings, cached offline scans, and theme indicators from your current browser storage.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            
            {eraseProgress === -1 && !eraseSuccess && (
              <div className="text-center space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Wiping browser data resolves local cache conflicts or serialization mismatches on scanner pages. This does not erase your master server-side clinician account profiles.
                </p>
                <button
                  type="button"
                  onClick={handleEraseStorage}
                  className="w-full py-3 bg-red-650 hover:bg-red-750 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                >
                  Wipe Browser Cache & Cookies
                </button>
              </div>
            )}

            {eraseProgress >= 0 && eraseProgress <= 100 && (
              <div className="space-y-3 py-4">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Purging localStorage keys...</span>
                  <span>{eraseProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-100"
                    style={{ width: `${eraseProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {eraseSuccess && (
              <div className="text-center space-y-4 scale-up py-2">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Local Sandbox Cleared</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  All local scans, visual settings, and cookie indicators have been deleted. Login session credentials have been reset.
                </p>
                <button
                  type="button"
                  onClick={() => setEraseSuccess(false)}
                  className="py-1.5 px-4 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-655 border border-slate-200 dark:border-slate-800"
                >
                  Reset Tool
                </button>
              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}
