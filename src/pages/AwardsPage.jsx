import { useState, useEffect } from "react";

/**
 * ==================================================================================
 * MedTrack Awards & Achievements Showcase Page
 * ==================================================================================
 * This page serves as a comprehensive portfolio of all certifications, security
 * compliance standards, global health logistics accolades, and timeline milestones
 * that MedTrack has obtained since its inception in 2018.
 * 
 * Features Included:
 * 1. Dynamic Hero Header: With subtle canvas-like background grid patterns and badge animations.
 * 2. Responsive Recognitions Grid: Category filters (All, Innovation, Healthcare, Security)
 *    coupled with click-to-expand card details showcasing verification credentials.
 * 3. Interactive Milestone Timeline: A vertical timeline (2018 - 2026) allowing users to
 *    reveal specific strategic milestones, expansion metrics, and key contributors per year.
 * 4. Badge Customizer Sandbox: Allows press and partner teams to customize MedTrack brand
 *    medals, choose colors/resolutions, and simulate high-res asset packet packaging with
 *    an animated download progress bar and HTML embed code copier.
 * 5. Certificate Verification Desk: A mock database verification search engine allowing
 *    auditors to query ISO/HIPAA certificates (e.g. ISO-27001-MED, HIPAA-SEC-2026).
 * 6. Nomination & Endorsement Form: A stateful feedback form with inline validation,
 *    submitting award recommendations directly via a simulated client-side api.
 * 
 * Design Standards:
 * - Premium dark mode support using Tailwind semantic classes.
 * - Fluid hover micro-transitions (scale, shadow, translations).
 * - Inline pure SVG graphics to guarantee dependency-free compilation.
 * 
 * Total Lines: 550+ lines (Designed for open-source reference and compliance checks).
 */

export default function AwardsPage() {
  // --- STATE VARIABLES ---
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState(2026);
  
  // Badge Sandbox states
  const [badgeColor, setBadgeColor] = useState("blue");
  const [badgeStyle, setBadgeStyle] = useState("filled");
  const [badgeResolution, setBadgeResolution] = useState("1080p");
  const [downloadProgress, setDownloadProgress] = useState(-1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Verification Desk states
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Nomination form states
  const [nominationForm, setNominationForm] = useState({
    awardName: "",
    nominatorName: "",
    organization: "",
    contactEmail: "",
    description: "",
    category: "innovation"
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // --- MOCK DATABASE DATA ---

  // 1. Accreditations and Recognitions
  const recognitions = [
    {
      id: "rec-01",
      year: "2026",
      category: "healthcare",
      title: "African Union Healthcare Pioneer Award",
      issuer: "African Union Health Commission",
      description: "Recognized for driving systemic improvements in medical equipment uptime and logistics transparency across healthcare networks in East Africa.",
      longDescription: "This award represents our collaborative efforts with public health clinics. By deploying decentralized telemetry monitors, MedTrack reduced hospital refrigerator downtime by 74%, safeguarding critical vaccines and temperature-sensitive assets.",
      authority: "AU Health Commission Audit Office",
      certId: "AU-HPA-2026-9081",
      impactMetric: "74% reduction in vaccine cold-chain failures",
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: "rec-02",
      year: "2025",
      category: "security",
      title: "ISO/IEC 27001 Certification",
      issuer: "International Organization for Standardization",
      description: "Awarded for demonstrating absolute compliance with international standard security management systems in patient and inventory tracking data.",
      longDescription: "Achieving ISO 27001 highlights MedTrack's commitment to cybersecurity. We undergo rigorous external audits annually to verify our access controls, threat mitigation, encryption protocols, and data recovery pipelines.",
      authority: "TUV SUD Certification Group",
      certId: "ISO-27001-MED",
      impactMetric: "Zero data leakage incidents in 8+ million transactions",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: "rec-03",
      year: "2025",
      category: "innovation",
      title: "Digital Health Excellence Award",
      issuer: "World Health Organization (WHO)",
      description: "Honored for pioneering integration connecting medical inventory tracking systems to national biometric registry feeds in emerging economies.",
      longDescription: "This global prize acknowledged our API design that allows real-time equipment assignment to regional clinics. By bridging device locations with local registry records, we eliminated double-allocation of ICU equipment.",
      authority: "WHO Digital Health Advisory Board",
      certId: "WHO-DHEA-2025-09",
      impactMetric: "12 regional ministries of health integrated",
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: "rec-04",
      year: "2024",
      category: "innovation",
      title: "Best Healthcare Start-up",
      issuer: "Africa Tech Summit",
      description: "Awarded for constructing a highly resilient decentralized procurement and inventory management system for Sub-Saharan clinical facilities.",
      longDescription: "Africa Tech Summit recognized MedTrack out of 300+ nominees. The jury commended our low-bandwidth offline sync mechanism, which allows rural clinics to catalog vital assets even during power grid failures.",
      authority: "ATS Startup Panel Advisory",
      certId: "ATS-BEST-2024-54",
      impactMetric: "350+ rural clinics active offline",
      icon: (
        <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: "rec-05",
      year: "2023",
      category: "healthcare",
      title: "Global Health Innovation Prize",
      issuer: "United Nations (UN)",
      description: "Recognized for optimizing vaccine storage tracking systems and ensuring stable cold-chain device functionality through preventive maintenance tools.",
      longDescription: "The UN health commission selected MedTrack's Preventive Care module. Our automated scheduling engine matches manufacturer specs with local technician logs, preempting failures before clinical risks arise.",
      authority: "UN Development Fund Panel",
      certId: "UN-GHIP-2023-A",
      impactMetric: "2.1 million vaccine doses tracked securely",
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      id: "rec-06",
      year: "2023",
      category: "security",
      title: "HIPAA Security Standards Attestation",
      issuer: "Apex Healthcare Audits",
      description: "Validated for maintaining rigorous administrative, physical, and technical safeguards for Protected Health Information (PHI) under US federal rules.",
      longDescription: "MedTrack achieved complete HIPAA compatibility by implementing cryptographic storage, automated logout thresholds, detailed access logs, and an encrypted peer-to-peer telemetry pipeline.",
      authority: "Apex Security Compliance Services",
      certId: "HIPAA-SEC-2026",
      impactMetric: "100% encryption compliance for medical databases",
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  // 2. Timeline Milestones Data
  const timelineMilestones = [
    {
      year: 2026,
      title: "Decentralized Network Integration",
      subtitle: "Connecting 500+ Public Hospitals",
      description: "MedTrack became the officially endorsed logistics tracking pipeline for the East African Community Health Alliance, integrating cross-border cold chain shipping.",
      metric: "520 Hospitals Active",
      badge: "Scale Milestone"
    },
    {
      year: 2025,
      title: "ISO Security Compliance & V2 Launch",
      subtitle: "Securing Medical IoT Devices",
      description: "Launched the MedTrack telemetry gateway supporting real-time hospital sensors, while securing our core servers under full ISO-27001 parameters.",
      metric: "8M+ Transactions Logged",
      badge: "Security Standard"
    },
    {
      year: 2024,
      title: "WHO and UN Partnerships",
      subtitle: "Deploying Remote Offline Sync",
      description: "Introduced advanced offline caching database algorithms enabling remote, grid-disconnected field stations to monitor inventory correctly.",
      metric: "WHO Innovation Endorsement",
      badge: "Global Partnerships"
    },
    {
      year: 2023,
      title: "Series A Funding & Clinical Pilot",
      subtitle: "Expanding to Regional Hubs",
      description: "Closed a $4.2M venture round led by global health tech funds. Expanded core telemetry services to regional supplier distribution centers.",
      metric: "$4.2M Venture Investment",
      badge: "Financial Growth"
    },
    {
      year: 2022,
      title: "Core Platform Alpha Deployment",
      subtitle: "First 50 Clinicians Onboarded",
      description: "Tested the primary inventory allocation software on clinical tablets at three national research hubs, validating the ease of QR code scanning.",
      metric: "99.1% User Satisfaction",
      badge: "Technical Feasibility"
    },
    {
      year: 2018,
      title: "Inception & Research Phase",
      subtitle: "Identifying Hospital Inventory Gaps",
      description: "Founded by a dedicated group of medical device engineers and supply-chain logistics specialists aiming to resolve equipment shortages.",
      metric: "3 Academic Whitepapers",
      badge: "Foundational Idea"
    }
  ];

  // --- EFFECTS ---

  // Handle mock download simulation progress
  useEffect(() => {
    let timer;
    if (downloadProgress >= 0 && downloadProgress < 100) {
      timer = setTimeout(() => {
        setDownloadProgress((prev) => prev + 10);
      }, 150);
    } else if (downloadProgress === 100) {
      setDownloadSuccess(true);
      timer = setTimeout(() => {
        setDownloadProgress(-1);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [downloadProgress]);

  // --- ACTIONS ---

  // Toggle card expansion for deep recognition details
  const handleToggleCard = (cardId) => {
    if (expandedCardId === cardId) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(cardId);
    }
  };

  // Perform search query validation for the Certificate Verification Desk
  const handleSearchVerify = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearched(true);
    const query = searchQuery.toLowerCase().trim();
    
    // Scan recognitions dataset
    const matched = recognitions.find(
      (rec) => rec.certId.toLowerCase() === query || rec.title.toLowerCase().includes(query)
    );

    if (matched) {
      setVerificationResult({
        status: "VERIFIED",
        title: matched.title,
        issuer: matched.issuer,
        authority: matched.authority,
        certId: matched.certId,
        impactMetric: matched.impactMetric,
        date: matched.year
      });
    } else {
      setVerificationResult({
        status: "NOT_FOUND",
        query: searchQuery
      });
    }
  };

  // Reset certificate search engine
  const handleResetSearch = () => {
    setSearchQuery("");
    setVerificationResult(null);
    setSearched(false);
  };

  // Trigger Badge Download simulation
  const handleStartDownload = () => {
    setDownloadSuccess(false);
    setDownloadProgress(0);
  };

  // Handle Nomination Form Inputs Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNominationForm((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate and submit nomination form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!nominationForm.awardName.trim()) {
      errors.awardName = "Award/Nomination name is required.";
    }
    if (!nominationForm.nominatorName.trim()) {
      errors.nominatorName = "Nominator name is required.";
    }
    if (!nominationForm.organization.trim()) {
      errors.organization = "Organization name is required.";
    }
    if (!nominationForm.contactEmail.trim()) {
      errors.contactEmail = "Contact email is required.";
    } else if (!/\S+@\S+\.\S+/.test(nominationForm.contactEmail)) {
      errors.contactEmail = "Email format is invalid.";
    }
    if (!nominationForm.description.trim()) {
      errors.description = "A brief description of the recognition is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Simulate database write
    setFormSubmitted(true);
    setTimeout(() => {
      // Auto-reset form after submission display
      setNominationForm({
        awardName: "",
        nominatorName: "",
        organization: "",
        contactEmail: "",
        description: "",
        category: "innovation"
      });
      setFormSubmitted(false);
    }, 5000);
  };

  // Filter list based on selected tab category
  const filteredRecognitions = recognitions.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. HERO HEADER SECTION */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-br from-blue-500/10 via-slate-50 to-slate-100 dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        
        {/* Fine Technical Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1] bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 mb-8 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Accreditation & Milestones
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mt-2 mb-6 tracking-tight leading-tight">
            Industry Standards & <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
              Accolades Showcase
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore the certifications, cybersecurity verifications, and global humanitarian awards that validate MedTrack's secure, ultra-reliable hospital logistics and telemetry ecosystem.
          </p>
          
          {/* Quick Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400">ISO 27001</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">Data Security Certified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">HIPAA</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">Patient PHI Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">99.9%</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">Asset Sync Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-amber-500">WHO & UN</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">Global Impact Partners</div>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-6 py-20">

        {/* 2. RECOGNITIONS GRID & TAB FILTER */}
        <section className="mb-28">
          <div className="text-center md:text-left md:flex md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Accreditations & Certificates
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                Filter and select individual certificates to inspect registration details, auditing authorities, and metrics.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-6 md:mt-0">
              {[
                { id: "all", label: "All Items" },
                { id: "innovation", label: "Innovation" },
                { id: "healthcare", label: "Clinical Impact" },
                { id: "security", label: "Compliance & Security" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setExpandedCardId(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeCategory === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-600/10"
                      : "bg-slate-200/60 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/30 dark:border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredRecognitions.map((item) => {
              const isExpanded = expandedCardId === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 ${
                    isExpanded ? "ring-2 ring-blue-500 border-transparent" : ""
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-slate-700/50">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                        CY {item.year}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-md font-bold text-slate-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Issuer: {item.issuer}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Expandable Details Area */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl">
                        <div>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-0.5">Auditing Body / Authority</span>
                          <span className="font-medium text-slate-500 dark:text-slate-400">{item.authority}</span>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-0.5">Certificate Registry ID</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{item.certId}</span>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-0.5">Primary Audited Metric</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{item.impactMetric}</span>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Audit Summary</span>
                          <p className="font-medium text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            {item.longDescription}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleToggleCard(item.id)}
                      className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-indigo-500 transition-colors flex items-center gap-1 focus:outline-none"
                    >
                      {isExpanded ? "Collapse Details" : "Verify Audit"}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. INTERACTIVE TIMELINE DESK */}
        <section className="mb-28 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.5rem] p-8 md:p-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Our Journey of Accolades
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Explore our growth since 2018. Select any year on the timeline map below to inspect regional deployments, compliance stamps, and impact milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Timeline Left Sidebar (Interactive Navigation Buttons) */}
            <div className="lg:col-span-4 flex lg:flex-col flex-row flex-wrap justify-between lg:justify-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              {timelineMilestones.map((milestone) => {
                const isSelected = selectedTimelineYear === milestone.year;
                return (
                  <button
                    key={milestone.year}
                    onClick={() => setSelectedTimelineYear(milestone.year)}
                    className={`flex-1 lg:flex-initial text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all duration-200 ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 ring-1 ring-slate-200 dark:ring-slate-700"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}></span>
                      <span className="font-black text-xs md:text-sm">{milestone.year}</span>
                    </div>
                    <span className="hidden lg:inline text-[10px] font-bold bg-slate-200/50 dark:bg-slate-950 px-2 py-0.5 rounded-md text-slate-500">
                      {milestone.year === 2018 ? "Inception" : "Verified"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Right Pane (Dynamic Info Card) */}
            <div className="lg:col-span-8">
              {timelineMilestones.map((milestone) => {
                if (milestone.year !== selectedTimelineYear) return null;
                return (
                  <div
                    key={milestone.year}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm relative overflow-hidden transition-all duration-500 scale-up"
                  >
                    {/* Ambient visual badge */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>

                    <div className="flex flex-wrap items-center gap-2.5 mb-6">
                      <span className="text-[10px] uppercase tracking-widest font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md">
                        {milestone.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        • Verified Record
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {milestone.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5">
                      {milestone.subtitle}
                    </p>

                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-5">
                      {milestone.description}
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Performance Metric</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{milestone.metric}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Verification receipt ID: MDT-HIST-${milestone.year}`)}
                          className="px-4 py-2 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          Logs Receipt
                        </button>
                        <button
                          onClick={() => alert(`Redirecting to regional reports of ${milestone.year}...`)}
                          className="px-4 py-2 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md shadow-blue-500/10"
                        >
                          Audit Document
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 4. BRAND BADGES CUSTOMIZER SANDBOX */}
        <section className="mb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md">
                Press & Media Kit
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
                Badge Customizer Sandbox
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                If you are a clinical partner or supplier, customize and grab high-quality compliance badges to embed on your website or portal.
              </p>
            </div>

            {/* Select Color */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Theme Variant</label>
              <div className="flex gap-2">
                {[
                  { id: "blue", label: "Clinical Blue", class: "bg-blue-600" },
                  { id: "emerald", label: "Security Emerald", class: "bg-emerald-600" },
                  { id: "indigo", label: "Legacy Purple", class: "bg-indigo-600" },
                  { id: "amber", label: "Pioneer Gold", class: "bg-amber-500" },
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => { setBadgeColor(color.id); setDownloadSuccess(false); }}
                    className={`w-6 h-6 rounded-full border-2 ${badgeColor === color.id ? "border-slate-800 dark:border-white ring-2 ring-blue-500/30" : "border-transparent"} ${color.class}`}
                    title={color.label}
                  ></button>
                ))}
              </div>
            </div>

            {/* Select Style */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Rendering Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "filled", label: "Filled Solid" },
                  { id: "outline", label: "Line Outlined" },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => { setBadgeStyle(style.id); setDownloadSuccess(false); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      badgeStyle === style.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent"
                        : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-350"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Resolution */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Resolution Export</label>
              <select
                value={badgeResolution}
                onChange={(e) => { setBadgeResolution(e.target.value); setDownloadSuccess(false); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 font-bold"
              >
                <option value="720p">720p Web Asset (Standard)</option>
                <option value="1080p">1080p Web Asset (HD)</option>
                <option value="vector">SVG Vector Stamp (Infinite Scale)</option>
              </select>
            </div>

            {/* Download Action & Progress Bar */}
            <div className="pt-2">
              {downloadProgress === -1 ? (
                <button
                  onClick={handleStartDownload}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all"
                >
                  Generate Asset Packet
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-500">
                    <span>Rendering Asset...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-150"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {downloadSuccess && (
                <div className="mt-3 bg-emerald-550/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
                  ✓ Asset Pack saved! Check your local download folder.
                </div>
              )}
            </div>

          </div>

          {/* Canvas Render Column (Preview) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-8 rounded-[2rem] text-center min-h-[360px]">
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Live Canvas Preview
            </div>

            {/* Simulated Badge Visual Frame */}
            <div className={`w-52 h-52 rounded-3xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
              badgeStyle === "filled"
                ? badgeColor === "blue"
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10"
                  : badgeColor === "emerald"
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/10"
                  : badgeColor === "indigo"
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/10"
                  : "bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/10"
                : `bg-transparent border-4 ${
                    badgeColor === "blue"
                      ? "border-blue-600 text-blue-600"
                      : badgeColor === "emerald"
                      ? "border-emerald-600 text-emerald-600"
                      : badgeColor === "indigo"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-amber-500 text-amber-500"
                  }`
            }`}>
              
              {/* Badge Icon (Dynamic render based on color state) */}
              <svg className="w-14 h-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              
              <span className="text-[9px] uppercase tracking-widest font-black opacity-80">
                MedTrack Security
              </span>
              <span className="text-md font-black tracking-tight mt-0.5">
                ISO 27001 COMPLIANT
              </span>
              <span className="text-[8px] uppercase tracking-widest font-black opacity-60 mt-1">
                Verified CY 2025
              </span>
            </div>

            {/* Embed code field */}
            <div className="w-full mt-6">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 text-left">Embed HTML Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`<iframe src="https://medtrack.org/badges/iso-27001-${badgeColor}-${badgeStyle}.html" width="200" height="200" frameBorder="0"></iframe>`}
                  className="w-full bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[10px] font-mono rounded-lg px-3 py-2 outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="https://medtrack.org/badges/iso-27001-${badgeColor}-${badgeStyle}.html" width="200" height="200" frameBorder="0"></iframe>`);
                    alert("Embed code copied to clipboard!");
                  }}
                  className="px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

          </div>

        </section>

        {/* 5. AUDITOR VERIFICATION DESK */}
        <section className="mb-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-12">
          
          <div className="max-w-xl mx-auto text-center mb-8">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-md">
              Secure Auditor Access
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Certificate Verification Desk
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Hospital compliance managers and regulatory officers can query ISO, HIPAA, or WHO certificates by entering reference numbers below.
            </p>
          </div>

          <form onSubmit={handleSearchVerify} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. ISO-27001-MED or HIPAA-SEC-2026"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs md:text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent font-medium"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Scan Certificate Registry
              </button>
              {searched && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {/* Verification Result Output */}
          {searched && verificationResult && (
            <div className="max-w-2xl mx-auto mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 scale-up">
              {verificationResult.status === "VERIFIED" ? (
                <div className="bg-emerald-500/5 border border-emerald-550/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-1 rounded-md mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-ping"></span>
                      Verified Secure & Active
                    </div>
                    <h4 className="text-md font-bold text-slate-900 dark:text-white">
                      {verificationResult.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Registration ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{verificationResult.certId}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Authority: <span className="font-semibold">{verificationResult.authority}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Audited Metric</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{verificationResult.impactMetric}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading signed validation receipt for registration ${verificationResult.certId}...`)}
                      className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition-colors"
                    >
                      Download Signed Receipt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center text-red-500 mx-auto mb-3 text-lg">
                    ⚠️
                  </div>
                  <h4 className="text-md font-bold text-slate-900 dark:text-white">
                    Registration Registry Record Not Found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    No registry match found for "<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{verificationResult.query}</span>". Please ensure spelling matches the ID on the credential document exactly, or request verification via email.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.href = "mailto:registrar@medtrack.org"}
                    className="mt-4 px-4 py-2 bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 hover:opacity-90 font-bold text-xs rounded-lg transition-all"
                  >
                    Contact Registry Office
                  </button>
                </div>
              )}
            </div>
          )}

        </section>

        {/* 6. NOMINATION & RECOMMENDATION DESK FORM */}
        <section className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-[2.5rem] p-8 md:p-12">
          
          <div className="max-w-xl mx-auto text-center mb-12">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md">
              Collaborative Registry
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
              Submit Award Notification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Know of an upcoming health-tech recognition or standard benchmark MedTrack should apply for? Help our compliance office register and compile the documentation.
            </p>
          </div>

          {formSubmitted ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center shadow-sm scale-up">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4 text-2xl animate-bounce">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Nomination Notification Logged!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Thank you for contributing to MedTrack's open-source database. Our compliance officer has received the submission and will verify the details shortly.
              </p>
              <div className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Confetti animation triggered • Auto resetting form...
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Award Title */}
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Award / Nomination Name
                </label>
                <input
                  type="text"
                  name="awardName"
                  value={nominationForm.awardName}
                  onChange={handleFormChange}
                  placeholder="e.g. HealthTech Global Summit 2026"
                  className={`bg-white dark:bg-slate-900 border ${formErrors.awardName ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500`}
                />
                {formErrors.awardName && <span className="text-[10px] text-red-500 font-bold mt-1">{formErrors.awardName}</span>}
              </div>

              {/* Nominator Name */}
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  name="nominatorName"
                  value={nominationForm.nominatorName}
                  onChange={handleFormChange}
                  placeholder="e.g. Dr. John Doe"
                  className={`bg-white dark:bg-slate-900 border ${formErrors.nominatorName ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500`}
                />
                {formErrors.nominatorName && <span className="text-[10px] text-red-500 font-bold mt-1">{formErrors.nominatorName}</span>}
              </div>

              {/* Organization */}
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Affiliated Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={nominationForm.organization}
                  onChange={handleFormChange}
                  placeholder="e.g. General Hospital Inc."
                  className={`bg-white dark:bg-slate-900 border ${formErrors.organization ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500`}
                />
                {formErrors.organization && <span className="text-[10px] text-red-500 font-bold mt-1">{formErrors.organization}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Contact Email
                </label>
                <input
                  type="text"
                  name="contactEmail"
                  value={nominationForm.contactEmail}
                  onChange={handleFormChange}
                  placeholder="e.g. johndoe@hospital.org"
                  className={`bg-white dark:bg-slate-900 border ${formErrors.contactEmail ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500`}
                />
                {formErrors.contactEmail && <span className="text-[10px] text-red-500 font-bold mt-1">{formErrors.contactEmail}</span>}
              </div>

              {/* Category */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Nomination Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "innovation", label: "Innovation & IoT" },
                    { id: "healthcare", label: "Clinical Impact" },
                    { id: "security", label: "Compliance Standards" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNominationForm((prev) => ({ ...prev, category: cat.id }))}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        nominationForm.category === cat.id
                          ? "bg-blue-600 text-white border-transparent shadow-md shadow-blue-500/10"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Description of Award / Selection Process
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={nominationForm.description}
                  onChange={handleFormChange}
                  placeholder="Explain why MedTrack should register this award, including submission links or guidelines..."
                  className={`bg-white dark:bg-slate-900 border ${formErrors.description ? "border-red-500" : "border-slate-200 dark:border-slate-800"} text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500`}
                ></textarea>
                {formErrors.description && <span className="text-[10px] text-red-500 font-bold mt-1">{formErrors.description}</span>}
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Log Nomination to Registry Desk
                </button>
              </div>

            </form>
          )}

        </section>

      </main>

    </div>
  );
}
