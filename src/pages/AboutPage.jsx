import { useState, useEffect } from "react";
import { 
  Heart, 
  Shield, 
  Activity, 
  Users, 
  Award, 
  TrendingUp, 
  Newspaper, 
  Search, 
  ArrowRight, 
  X, 
  Mail, 
  Download, 
  Globe, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Clock, 
  ArrowUpRight 
} from "lucide-react";

/**
 * ============================================================================
 * MEDTRACK - ABOUT / PRESS PAGE COMPONENT
 * ============================================================================
 * 
 * 1. DESIGN SYSTEM IMPLEMENTATION:
 *    - Follows the project design system using TailwindCSS utility classes.
 *    - Fully respects light/dark themes via tailwind configuration tokens:
 *      * bg-surface / bg-card
 *      * text-primary / text-secondary
 *      * border-subtle / border-strong
 *      * bg-hover
 * 
 * 2. COMPONENT ARCHITECTURE & STATE:
 *    - `activeYear`: Controls the interactive history timeline.
 *    - `expandedValue`: Tracks which value card is expanded for details.
 *    - `selectedMember`: Opens the deep-dive profile modal for team leaders.
 *    - `teamFilter`: Handles live filtering of team cards (Founders, Engineering, Advisors).
 *    - `pressSearch`: Handles real-time search query filtering on press publications.
 *    - `pressFilter`: Handles category filtering for media publications.
 *    - `showMediaKit`: Toggles visibility of download resources.
 * 
 * 3. INTERACTION & ANIMATIONS:
 *    - Smooth transitions on hover and clicks (`transition-all duration-300`).
 *    - Custom keyframe animations (`animate-fadeSlideIn`) for dynamic content loading.
 *    - SVG-based abstract illustrations for premium visual aesthetics.
 * 
 * 4. ACCESSIBILITY & SEO BEST PRACTICES:
 *    - Semantic HTML structure: `<section>`, `<main>`, `<article>`, `<header>`.
 *    - Clear heading hierarchies.
 *    - ARIA attributes where relevant (modals, active tabs, buttons).
 *    - Fully responsive layouts supporting mobile, tablet, and desktop viewports.
 * 
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// CONSTANTS: TIMELINE DATA
// ----------------------------------------------------------------------------
const TIMELINE_DATA = [
  {
    year: "2018",
    title: "The Genesis of MedTrack",
    subtitle: "A vision for unified patient logs",
    description: "MedTrack was founded in Accra, Ghana by a passionate team of doctors, developers, and designers. Frustrated by paper records and clinical inefficiencies, the founders set out to build a digital platform linking inventory to national IDs.",
    stat: "1 Clinic",
    statLabel: "Initial Pilot Program",
    icon: Sparkles
  },
  {
    year: "2020",
    title: "Pandemic Response & Cold Chain",
    subtitle: "Adapting telemetry for storage logs",
    description: "As supply chains faced severe strains, MedTrack deployed its first IoT temperature telemetry sensors. This integration enabled real-time validation of vaccine cold chains across regional medical depots.",
    stat: "45 Facilities",
    statLabel: "Connected Depots",
    icon: Activity
  },
  {
    year: "2022",
    title: "Biometric Integration Launch",
    subtitle: "Universal record portability",
    description: "In collaboration with national biometric registry commissions, MedTrack introduced secure integrations that link electronic health logs directly to national identity cards, guaranteeing zero duplicate profiles.",
    stat: "100k+ Users",
    statLabel: "Patient Profiles Created",
    icon: Shield
  },
  {
    year: "2024",
    title: "Procurement Network Release",
    subtitle: "Connecting hospitals and suppliers",
    description: "Recognizing that device downtime is often caused by delayed parts, MedTrack released the Supplier Centre. This module connected hospitals directly to verified medical equipment vendors for quotes and invoices.",
    stat: "$2.4M",
    statLabel: "Medical Invoices Settled",
    icon: TrendingUp
  },
  {
    year: "2026",
    title: "Global Reach & Standards",
    subtitle: "Pioneering digital health logs",
    description: "Today, MedTrack operates globally with ISO/IEC 27001 compliance. We continue to build open-source-friendly infrastructure to connect clinics, technicians, and medical suppliers across multiple countries.",
    stat: "25k+ Devices",
    statLabel: "Assets Actively Tracked",
    icon: Award
  }
];

// ----------------------------------------------------------------------------
// CONSTANTS: CORE VALUES DATA
// ----------------------------------------------------------------------------
const CORE_VALUES = [
  {
    id: "empathy",
    title: "Empathy-Driven Design",
    description: "We build for medical professionals under pressure. Software should reduce cognitive load, not add to it.",
    details: "Our product teams regularly shadow doctors, nurses, and medical technicians in real clinics. By seeing how clinicians interact with screens while treating patients, we design intuitive interfaces that prioritize accessibility, legibility in low light, and one-tap updates.",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10"
  },
  {
    id: "trust",
    title: "Absolute Trust & Security",
    description: "Health data security is a human right. We maintain strict compliance standards on all connected databases.",
    details: "We implement advanced encryption algorithms (AES-256) at rest and TLS 1.3 in transit. Our infrastructure conforms to HIPAA and GDPR guidelines, ensuring patients control their medical records while audit trails track every access request transparently.",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "innovation",
    title: "Continuous Telemetry",
    description: "We lead with IoT sensor feeds, custom QR codes, and predictive device maintenance analytics.",
    details: "By analyzing telemetry logs, our systems predict when critical equipment is likely to fail. We automate request-for-quotes to suppliers, saving days of administrative delays and keeping lifesaving machinery operational.",
    icon: Activity,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    id: "accountability",
    title: "Community Accountability",
    description: "We believe in open source values, transparent reporting, and collaborative developer networks.",
    details: "A significant portion of our codebase, API integrations, and developer toolkits are open source. We actively host hackathons, partner with local tech universities, and publish our system uptime statistics publicly.",
    icon: Users,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  }
];

// ----------------------------------------------------------------------------
// CONSTANTS: TEAM MEMBERS DATA
// ----------------------------------------------------------------------------
const TEAM_MEMBERS = [
  {
    name: "Dr. Kofi Boateng",
    role: "Co-Founder & Chief Medical Officer",
    category: "founders",
    bio: "Kofi is a practicing pediatrician with 15 years of experience in regional hospitals. He oversees the clinical accuracy of MedTrack's workflows and leads partnership outreach with national health ministries.",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    email: "kofi.b@medtrack.org",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Sophia Alabi",
    role: "Co-Founder & Chief Executive Officer",
    category: "founders",
    bio: "Sophia is an infrastructure engineer previously at major global tech companies. She returned to Ghana to apply data scalability to local healthcare logistics, securing MedTrack's initial seed capital.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    email: "sophia.a@medtrack.org",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Dipanshu Batra",
    role: "Director of Engineering & Systems Architecture",
    category: "engineering",
    bio: "Dipanshu is a full-stack engineer and open-source contributor. He designs the row-level security protocols and real-time database syncing mechanisms connecting rural clinics to main regional servers.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    email: "dipanshu.b@medtrack.org",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Elena Rostova",
    role: "Lead Interface Designer",
    category: "engineering",
    bio: "Elena specializes in design systems and accessibility. She ensures the MedTrack dashboard remains fully functional, high-contrast, and fast-loading across older mobile browsers and tablets.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    email: "elena.r@medtrack.org",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Prof. Aaron Kojo",
    role: "Senior Academic Research Advisor",
    category: "advisors",
    bio: "Aaron is a university professor in medical informatics. He advises MedTrack on peer-reviewed whitepapers, data integrity audits, and grant funding opportunities from global health organizations.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    email: "kojo.a@medtrack.org",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Clara Vance",
    role: "Supply Chain & Logistics Lead",
    category: "advisors",
    bio: "Clara has spent two decades managing cold-chain logistics for international NGOs. She consults on our supplier center, shipping status models, and courier partner APIs.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    email: "clara.v@medtrack.org",
    linkedin: "#",
    twitter: "#"
  }
];

// ----------------------------------------------------------------------------
// CONSTANTS: PRESS RELEASES DATA
// ----------------------------------------------------------------------------
const PRESS_RELEASES = [
  {
    id: 1,
    title: "MedTrack Achieves ISO/IEC 27001 Certification for Clinical Data Management",
    date: "June 12, 2026",
    summary: "MedTrack officially receives international accreditation for information security management, affirming safe practices in patient identification and medical inventory records.",
    category: "Security",
    link: "#"
  },
  {
    id: 2,
    title: "Supplier Centre Launch Connects Over 150 Medical Equipment Vendors",
    date: "February 24, 2026",
    summary: "Our new automated bidding system lets hospitals request digital quotes directly, cutting supply chain delays and keeping emergency equipment online longer.",
    category: "Product Release",
    link: "#"
  },
  {
    id: 3,
    title: "Open Source Collaboration Program Announced with Regional Tech Hubs",
    date: "November 08, 2025",
    summary: "MedTrack is releasing its core telemetry dashboards as open-source codebases, fostering local developer talent and custom hospital integrations.",
    category: "Community",
    link: "#"
  },
  {
    id: 4,
    title: "WHO Highlights MedTrack Biometric Registry in Digital Health Report",
    date: "August 19, 2025",
    summary: "The World Health Organization recognizes MedTrack's biometric ID link as a model for universal healthcare accessibility and patient record portability.",
    category: "Accolade",
    link: "#"
  }
];

// ============================================================================
// MAIN EXPORTED COMPONENT
// ============================================================================
export default function AboutPage() {
  // --- React State Hooks ---
  const [activeYear, setActiveYear] = useState("2026");
  const [expandedValue, setExpandedValue] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamFilter, setTeamFilter] = useState("all");
  const [pressSearch, setPressSearch] = useState("");
  const [pressFilter, setPressFilter] = useState("all");
  const [showMediaKit, setShowMediaKit] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({ type: null, message: "" });

  // Find active timeline entry details
  const activeTimelineItem = TIMELINE_DATA.find((item) => item.year === activeYear) || TIMELINE_DATA[TIMELINE_DATA.length - 1];
  const ActiveTimelineIcon = activeTimelineItem.icon;

  // Filter team members based on category
  const filteredTeam = TEAM_MEMBERS.filter(
    (member) => teamFilter === "all" || member.category === teamFilter
  );

  // Filter press releases based on search query and category
  const filteredPress = PRESS_RELEASES.filter((press) => {
    const matchesSearch = 
      press.title.toLowerCase().includes(pressSearch.toLowerCase()) || 
      press.summary.toLowerCase().includes(pressSearch.toLowerCase());
    const matchesCategory = 
      pressFilter === "all" || press.category === pressFilter;
    return matchesSearch && matchesCategory;
  });

  // Extract list of unique press categories for filter buttons
  const pressCategories = ["all", ...new Set(PRESS_RELEASES.map((pr) => pr.category))];

  // Handle email subscription submission
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail) {
      setSubscribeStatus({ type: "error", message: "Please provide a valid email address." });
      return;
    }
    if (!subscribeEmail.includes("@")) {
      setSubscribeStatus({ type: "error", message: "Email format seems incorrect." });
      return;
    }
    // Simulate successful subscription
    setSubscribeStatus({ 
      type: "success", 
      message: "Thank you! You have been subscribed to MedTrack press alerts." 
    });
    setSubscribeEmail("");
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedMember(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-surface text-primary min-h-screen pb-16 font-sans">
      
      {/* ----------------------------------------------------------------------
          1. HERO HEADER SECTION
          ---------------------------------------------------------------------- */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-transparent border-b border-subtle">
        
        {/* Animated Background Vector Grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Aesthetic Gradient Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Our Mission
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-primary">
              Democratizing health record access <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                across emerging markets.
              </span>
            </h1>

            <p className="text-md md:text-lg text-secondary leading-relaxed max-w-2xl">
              MedTrack is building Africa's true Health Information System and driving universal access by building infrastructure that connects patient health data to national biometric IDs. We empower clinics, support field technicians, and optimize medical procurement.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="#timeline"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                Explore Milestones
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#team"
                className="px-6 py-3 bg-card border border-subtle text-secondary hover:text-primary rounded-2xl text-xs font-bold transition-all hover:bg-hover"
              >
                Meet Our Leadership
              </a>
            </div>
          </div>

          {/* Hero Statistics Column */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            
            <div className="p-6 bg-card border border-subtle rounded-3xl space-y-2">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">2018</span>
              <p className="text-xs font-bold text-primary">Founded</p>
              <p className="text-[11px] text-secondary leading-normal">In Accra, Ghana by physicians & tech leads.</p>
            </div>

            <div className="p-6 bg-card border border-subtle rounded-3xl space-y-2">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">25k+</span>
              <p className="text-xs font-bold text-primary">Devices Monitored</p>
              <p className="text-[11px] text-secondary leading-normal">Uptime logs tracked for clinical machinery.</p>
            </div>

            <div className="p-6 bg-card border border-subtle rounded-3xl space-y-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
              <p className="text-xs font-bold text-primary">Biometric Sync</p>
              <p className="text-[11px] text-secondary leading-normal">Ensuring portable patient identities.</p>
            </div>

            <div className="p-6 bg-card border border-subtle rounded-3xl space-y-2">
              <span className="text-3xl font-black text-amber-500">ISO</span>
              <p className="text-xs font-bold text-primary">27001 Certified</p>
              <p className="text-[11px] text-secondary leading-normal">International standards of data security.</p>
            </div>

          </div>

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          2. INTERACTIVE TIMELINE SECTION
          ---------------------------------------------------------------------- */}
      <section id="timeline" className="py-24 max-w-7xl mx-auto px-6 border-b border-subtle/50">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full">
            Our Journey
          </span>
          <h2 className="text-3xl font-black text-primary">MedTrack Milestones</h2>
          <p className="text-sm text-secondary leading-relaxed">
            From a single volunteer clinic to an international logistics network, explore the chronological history of our platform.
          </p>
        </div>

        {/* Timeline Navigation Hub */}
        <div className="relative flex justify-between items-center max-w-4xl mx-auto mb-12">
          
          {/* Connecting Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-subtle -translate-y-1/2 -z-10"></div>
          
          {TIMELINE_DATA.map((item) => {
            const isSelected = item.year === activeYear;
            return (
              <button
                key={item.year}
                onClick={() => setActiveYear(item.year)}
                className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white scale-125 shadow-lg shadow-blue-500/20"
                    : "bg-card border-subtle text-secondary hover:border-strong hover:text-primary"
                }`}
                aria-label={`Show milestone details for year ${item.year}`}
                aria-current={isSelected ? "step" : undefined}
              >
                {item.year}
              </button>
            );
          })}

        </div>

        {/* Display Panel for Active Timeline Item */}
        <div className="max-w-4xl mx-auto bg-card border border-subtle rounded-[2rem] p-8 md:p-12 shadow-sm animate-fadeSlideIn">
          
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8 space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/10">
                  <ActiveTimelineIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    Milestone Year {activeTimelineItem.year}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-primary leading-tight">
                    {activeTimelineItem.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs font-bold text-secondary uppercase tracking-widest border-l-2 border-blue-500 pl-3">
                {activeTimelineItem.subtitle}
              </p>

              <p className="text-sm text-secondary leading-relaxed">
                {activeTimelineItem.description}
              </p>

            </div>

            {/* Achievement Highlight Sub-Card */}
            <div className="md:col-span-4 bg-surface border border-subtle rounded-3xl p-6 text-center space-y-2">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {activeTimelineItem.stat}
              </span>
              <p className="text-xs font-bold text-primary">
                {activeTimelineItem.statLabel}
              </p>
              <p className="text-[10px] text-secondary leading-normal">
                Verifiable ecosystem impact audit.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          3. CORE VALUES SECTION
          ---------------------------------------------------------------------- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-subtle/50">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full">
            Our Culture
          </span>
          <h2 className="text-3xl font-black text-primary">Values in Action</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Click on any value card to read more about how our principles guide our product developments, user interactions, and open-source contributions.
          </p>
        </div>

        {/* Core Values Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {CORE_VALUES.map((val) => {
            const isExpanded = expandedValue === val.id;
            const ValIcon = val.icon;
            
            return (
              <div
                key={val.id}
                onClick={() => setExpandedValue(isExpanded ? null : val.id)}
                className={`bg-card border rounded-3xl p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:border-strong ${
                  isExpanded ? "border-blue-500/50 ring-4 ring-blue-500/5" : "border-subtle"
                }`}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedValue(isExpanded ? null : val.id);
                  }
                }}
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 ${val.bgColor} rounded-2xl flex items-center justify-center ${val.color}`}>
                      <ValIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                      {isExpanded ? "Click to Collapse" : "Click to Read Details"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-primary mb-3">
                    {val.title}
                  </h3>

                  <p className="text-sm text-secondary leading-relaxed">
                    {val.description}
                  </p>

                  {/* Expanded detail box */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? "max-h-[300px] mt-6 pt-6 border-t border-subtle/50 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-xs text-secondary leading-relaxed bg-surface/30 p-4 rounded-2xl border border-subtle/40">
                      {val.details}
                    </p>
                  </div>

                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>{isExpanded ? "Show Less" : "Learn More"}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          4. TEAM & ADVISORY BOARD SECTION
          ---------------------------------------------------------------------- */}
      <section id="team" className="py-24 max-w-7xl mx-auto px-6 border-b border-subtle/50">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full">
              Leadership
            </span>
            <h2 className="text-3xl font-black text-primary">Meet the Team</h2>
            <p className="text-sm text-secondary leading-relaxed">
              We are a team of clinicians, hardware specialists, security architects, and supply chain analysts working together globally.
            </p>
          </div>

          {/* Department Filter Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Members" },
              { id: "founders", label: "Founders" },
              { id: "engineering", label: "Product & Engineering" },
              { id: "advisors", label: "Advisors" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTeamFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  teamFilter === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-card border border-subtle text-secondary hover:text-primary hover:bg-hover"
                }`}
                aria-label={`Filter team list by ${tab.label}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {filteredTeam.map((member) => (
            <article
              key={member.name}
              onClick={() => setSelectedMember(member)}
              className="group bg-card border border-subtle rounded-3xl overflow-hidden hover:shadow-lg hover:border-strong transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              
              {/* Member Image Header */}
              <div className="relative aspect-video overflow-hidden bg-surface">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                    {member.category.toUpperCase()}
                  </span>
                  <h3 className="text-md font-bold leading-tight mt-1">{member.name}</h3>
                </div>
              </div>

              {/* Bio Preview Content */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {member.role}
                </p>
                <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                  {member.bio}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-4 border-t border-subtle/50 bg-surface/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                  Read Full Bio
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                <div className="flex gap-2">
                  <span className="w-6 h-6 rounded bg-surface hover:bg-hover flex items-center justify-center text-secondary hover:text-primary transition-colors text-[11px]">
                    in
                  </span>
                  <span className="w-6 h-6 rounded bg-surface hover:bg-hover flex items-center justify-center text-secondary hover:text-primary transition-colors text-[11px]">
                    t
                  </span>
                </div>
              </div>

            </article>
          ))}

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          5. PRESS ROOM & MEDIA CENTER
          ---------------------------------------------------------------------- */}
      <section id="press" className="py-24 max-w-7xl mx-auto px-6">
        
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Side: Filter and News Search Widgets */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full">
                Press Room
              </span>
              <h2 className="text-3xl font-black text-primary">Media & News</h2>
              <p className="text-sm text-secondary leading-relaxed">
                Stay updated with our latest media releases, standard audits, and collaborative network announcements.
              </p>
            </div>

            {/* Live Press Article Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search publications..."
                value={pressSearch}
                onChange={(e) => setPressSearch(e.target.value)}
                className="w-full bg-card text-primary placeholder-secondary border border-subtle rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Press Category Selectors */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {pressCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPressFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      pressFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-card border border-subtle text-secondary hover:text-primary hover:bg-hover"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Assets Download Widget Accordion */}
            <div className="bg-card border border-subtle rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-500" />
                MedTrack Media Kit
              </h3>
              <p className="text-[11px] text-secondary leading-normal">
                Download verified high-resolution logos, brand guidelines, and approved executive headshots.
              </p>
              
              {showMediaKit ? (
                <div className="space-y-2 pt-2 border-t border-subtle/50 animate-fadeSlideIn">
                  <a href="#" className="flex items-center justify-between text-xs text-secondary hover:text-blue-600 transition-colors p-2 bg-surface rounded-lg">
                    <span>MedTrack Brand Assets (.zip)</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <a href="#" className="flex items-center justify-between text-xs text-secondary hover:text-blue-600 transition-colors p-2 bg-surface rounded-lg">
                    <span>Executive Biographies (.pdf)</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setShowMediaKit(false)}
                    className="w-full text-center text-[10px] font-bold text-red-500 hover:underline pt-2"
                  >
                    Hide Downloads
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaKit(true)}
                  className="w-full py-2 bg-surface hover:bg-hover border border-subtle text-xs font-bold rounded-xl transition-all"
                >
                  Access Brand Assets
                </button>
              )}
            </div>

          </div>

          {/* Right Side: Publications Stream & Newsletter */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="space-y-4">
              
              {filteredPress.length > 0 ? (
                filteredPress.map((press) => (
                  <article
                    key={press.id}
                    className="bg-card border border-subtle rounded-3xl p-8 hover:shadow-md hover:border-strong transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                      <span className="flex items-center gap-1 text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        {press.date}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-[9px]">
                        {press.category}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-primary mb-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer">
                      {press.title}
                    </h3>

                    <p className="text-xs text-secondary leading-relaxed mb-4">
                      {press.summary}
                    </p>

                    <a href={press.link} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      Read Full Article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                  </article>
                ))
              ) : (
                <div className="bg-card border border-subtle rounded-[2rem] p-12 text-center">
                  <Newspaper className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
                  <h4 className="text-sm font-bold text-primary mb-2">No publications found</h4>
                  <p className="text-xs text-secondary max-w-xs mx-auto">
                    Try checking other keywords or categories. We release monthly operational reports regularly.
                  </p>
                </div>
              )}

            </div>

            {/* Newsletter Subscription Box */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
                
                <div className="md:col-span-7 space-y-2">
                  <h4 className="text-lg md:text-xl font-bold">Subscribe to Media Alerts</h4>
                  <p className="text-blue-100 text-xs leading-relaxed">
                    Get real-time updates regarding new standards compliance, product milestones, and open-source developer hub launches.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="md:col-span-5 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="media@company.org"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      className="bg-white/10 text-white placeholder-blue-200 border border-white/20 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white/15 focus:border-white/40 flex-1"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow"
                    >
                      Subscribe
                    </button>
                  </div>

                  {subscribeStatus.message && (
                    <p className={`text-[10px] font-bold ${
                      subscribeStatus.type === "success" ? "text-emerald-300" : "text-rose-300"
                    }`}>
                      {subscribeStatus.message}
                    </p>
                  )}
                </form>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ----------------------------------------------------------------------
          6. DETAILED TEAM MEMBER PROFILE MODAL
          ---------------------------------------------------------------------- */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeSlideIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-member-name"
        >
          
          <div className="bg-card border border-strong rounded-[2rem] max-w-2xl w-full overflow-hidden shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface/80 hover:bg-hover border border-subtle flex items-center justify-center text-primary transition-all focus:outline-none"
              aria-label="Close bio details"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-12">
              
              {/* Member Image Column */}
              <div className="md:col-span-5 h-64 md:h-full relative bg-surface">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bio Core Details Column */}
              <div className="md:col-span-7 p-8 space-y-6">
                
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {selectedMember.category.toUpperCase()}
                  </span>
                  <h3 id="modal-member-name" className="text-xl font-black text-primary mt-1">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-secondary font-medium mt-1">
                    {selectedMember.role}
                  </p>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  {selectedMember.bio}
                </p>

                {/* Contact and Social Connections */}
                <div className="pt-4 border-t border-subtle flex items-center justify-between">
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="flex items-center gap-1.5 text-xs text-secondary hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">{selectedMember.email}</span>
                  </a>
                  
                  <div className="flex gap-2">
                    <a
                      href={selectedMember.linkedin}
                      className="w-8 h-8 rounded-full bg-surface border border-subtle flex items-center justify-center text-secondary hover:text-primary transition-all"
                      aria-label="LinkedIn Profile"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                      </svg>
                    </a>
                    <a
                      href={selectedMember.twitter}
                      className="w-8 h-8 rounded-full bg-surface border border-subtle flex items-center justify-center text-secondary hover:text-primary transition-all"
                      aria-label="Twitter Profile"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
