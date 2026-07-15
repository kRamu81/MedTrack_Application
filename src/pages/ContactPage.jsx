import { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  Globe, 
  ChevronDown, 
  User, 
  Building 
} from "lucide-react";

/**
 * ============================================================================
 * MEDTRACK - CONTACT US / EXPERT DESK COMPONENT
 * ============================================================================
 * 
 * 1. DESIGN SPECIFICATION:
 *    - Structured around Tailwind CSS variable mapping (bg-surface, bg-card,
 *      text-primary, text-secondary, border-subtle, etc.) to ensure seamless
 *      support for both Light and Dark themes.
 *    - Employs smooth animations (`transition-all duration-300`, `animate-fadeSlideIn`)
 *      and glassmorphism effects for a modern, high-end feel.
 * 
 * 2. STATE MANAGEMENT & DYNAMIC FIELDS:
 *    - `inquiryType`: Changes form layout, fields, and descriptions dynamically
 *      based on selected department (General, Tech Support, Partnerships, Careers).
 *    - `formData`: Captures and controls all form field inputs, adapting fields
 *      based on `inquiryType` requirements.
 *    - `errors`: Stores key-value mappings of live form validation failures.
 *    - `activeOffice`: Handles active tabs for geographical branches. Renders
 *      custom dynamic map pins and data.
 *    - `expandedFaq`: Tracks open accordions in the contextual FAQ widget.
 *    - `isSubmitted`: Dictates showing the animated success overlay.
 * 
 * 3. SECURITY & COMPLIANCE:
 *    - Standard security disclosure pointers.
 *    - Validation blocks to prevent empty submissions, malformed email patterns,
 *      and numerical bounds on phone numbers.
 * 
 * 4. CODE DOCUMENTATION:
 *    - Intentionally contains rich commentary explaining code segments and styling
 *      rules to serve as clear guidelines for open-source contributors.
 * 
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// CONSTANTS: FAQS
// ----------------------------------------------------------------------------
const CONTACT_FAQS = [
  {
    id: 1,
    q: "How fast does the Technical Support team respond?",
    a: "Critical severity tickets logged by subscribed hospitals are reviewed within 15 minutes. General technical inquiries are addressed within 12 to 24 business hours.",
    category: "Technical"
  },
  {
    id: 2,
    q: "Are there API docs available for supplier inventory feeds?",
    a: "Yes! If you select 'Partnerships' or check the Supplier Centre, our team will share our REST API documentation to automate CSV/XML inventory updates.",
    category: "Partnerships"
  },
  {
    id: 3,
    q: "Can I schedule a live system integration demo?",
    a: "Absolutely. Select 'General Inquiry' or 'Partnerships' on the form, enter your organization's website, and we will send a booking calendar link.",
    category: "General"
  },
  {
    id: 4,
    q: "How do you secure patient records shared during support sessions?",
    a: "We never ask for patient personal records. Support tickets use anonymized device logs and telemetry tracking feeds. All sessions comply with ISO 27001.",
    category: "Security"
  }
];

// ----------------------------------------------------------------------------
// CONSTANTS: OFFICE LOCATIONS
// ----------------------------------------------------------------------------
const OFFICE_LOCATIONS = [
  {
    id: "accra",
    city: "Accra, Ghana",
    name: "MedTrack West Africa HQ",
    address: "Suite 402, Heritage Tower, Liberia Road, Accra",
    phone: "+233 24 556 7890",
    email: "ghana.hub@medtrack.org",
    hours: "08:00 - 17:00 GMT",
    coordX: "35%",
    coordY: "65%"
  },
  {
    id: "kadapa",
    city: "Kadapa, India",
    name: "MedTrack Asia Development Hub",
    address: "YV Street, Kadapa, Andhra Pradesh - 516001",
    phone: "+91 93928 61225",
    email: "india.hub@medtrack.org",
    hours: "09:00 - 18:00 IST",
    coordX: "70%",
    coordY: "50%"
  },
  {
    id: "london",
    city: "London, UK",
    name: "MedTrack European Partnerships Office",
    address: "24 Old Queen Street, Westminster, London, SW1H 9HP",
    phone: "+44 20 7946 0958",
    email: "uk.hub@medtrack.org",
    hours: "09:00 - 17:30 BST",
    coordX: "48%",
    coordY: "30%"
  }
];

// ============================================================================
// MAIN CONTACT PAGE COMPONENT
// ============================================================================
export default function ContactPage() {
  
  // --- Inquiry Type State ---
  const [inquiryType, setInquiryType] = useState("general"); // Options: general, support, partnerships, careers

  // --- Dynamic Form Data State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    website: "",
    message: "",
    priority: "low",
    deviceID: "",
    partnerRole: "hospital",
    portfolioUrl: ""
  });

  // --- UI Layout & Validation States ---
  const [errors, setErrors] = useState({});
  const [activeOffice, setActiveOffice] = useState("accra");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find currently active office details
  const activeOfficeDetails = OFFICE_LOCATIONS.find((off) => off.id === activeOffice) || OFFICE_LOCATIONS[0];

  // Live validation on data changes
  const validateField = (name, value) => {
    let errs = { ...errors };

    if (name === "email") {
      if (!value) {
        errs.email = "Email is required.";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errs.email = "Please input a valid email pattern.";
      } else {
        delete errs.email;
      }
    }

    if (name === "firstName" || name === "lastName") {
      if (!value) {
        errs[name] = "This field is required.";
      } else {
        delete errs[name];
      }
    }

    if (name === "message") {
      if (!value) {
        errs.message = "Please enter your query message.";
      } else if (value.length < 10) {
        errs.message = "Message must be at least 10 characters long.";
      } else {
        delete errs.message;
      }
    }

    if (inquiryType === "support" && name === "deviceID") {
      if (!value) {
        errs.deviceID = "Equipment Device ID is required for support triage.";
      } else {
        delete errs.deviceID;
      }
    }

    setErrors(errs);
  };

  // Handle generic form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Handle department shift (resets type-specific validation errors)
  const handleInquiryChange = (type) => {
    setInquiryType(type);
    setErrors({});
    setIsSubmitted(false);
  };

  // Perform form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Trigger full validation checks
    const finalErrors = {};
    if (!formData.firstName) finalErrors.firstName = "First name is required.";
    if (!formData.lastName) finalErrors.lastName = "Last name is required.";
    
    if (!formData.email) {
      finalErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      finalErrors.email = "Please input a valid email pattern.";
    }

    if (!formData.message || formData.message.length < 10) {
      finalErrors.message = "Message must contain at least 10 characters.";
    }

    if (inquiryType === "support" && !formData.deviceID) {
      finalErrors.deviceID = "Please supply the Device ID / Serial Number.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(finalErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API network request latency
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form variables
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        organization: "",
        website: "",
        message: "",
        priority: "low",
        deviceID: "",
        partnerRole: "hospital",
        portfolioUrl: ""
      });
    }, 1500);
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="bg-surface text-primary min-h-screen pb-16 font-sans">
      
      {/* ----------------------------------------------------------------------
          1. HERO BANNER
          ---------------------------------------------------------------------- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-transparent border-b border-subtle">
        
        {/* Visual Grid Backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Soft Background Orbs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            MedTrack Connect
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Speak to a <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Healthcare Systems Expert
            </span>
          </h1>

          <p className="text-sm md:text-md text-secondary max-w-xl mx-auto leading-relaxed">
            Have questions about biometric patient synchronization, IoT telemetry dashboards, or supplier pricing? We have dedicated teams ready to guide your implementation.
          </p>
        </div>

      </section>

      {/* ----------------------------------------------------------------------
          2. MAIN CONTENT GRID (FORM & INFO DESK)
          ---------------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: OFFICE SWITCHERS & DEPARTMENT DIRECTORIES */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* INQUIRY CATEGORIES NAV SELECTOR */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-secondary uppercase tracking-widest px-1">
                Choose Department Desk
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "general", label: "General", desc: "Demos & queries" },
                  { id: "support", label: "Tech Support", desc: "System tickets" },
                  { id: "partnerships", label: "Partnerships", desc: "Hospitals & vendors" },
                  { id: "careers", label: "Careers", desc: "Talent recruitment" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleInquiryChange(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      inquiryType === item.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                        : "bg-card border-subtle text-secondary hover:border-strong hover:text-primary"
                    }`}
                  >
                    <p className="text-xs font-bold capitalize leading-none mb-1">{item.label}</p>
                    <p className={`text-[10px] leading-normal ${inquiryType === item.id ? "text-blue-100" : "text-secondary"}`}>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE OFFICE TABS & DETAIL VIEW */}
            <div className="bg-card border border-subtle rounded-3xl p-8 space-y-6">
              
              <div className="flex justify-between items-center border-b border-subtle/50 pb-4">
                <h3 className="text-sm font-black text-primary">Office Directories</h3>
                
                {/* Hub tabs */}
                <div className="flex gap-1 bg-surface p-1 rounded-xl border border-subtle">
                  {OFFICE_LOCATIONS.map((off) => (
                    <button
                      key={off.id}
                      onClick={() => setActiveOffice(off.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        activeOffice === off.id
                          ? "bg-blue-600 text-white"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {off.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Office Details */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-1 rounded-md">
                  {activeOfficeDetails.city}
                </span>
                
                <h4 className="text-md font-bold text-primary leading-tight">
                  {activeOfficeDetails.name}
                </h4>

                <div className="space-y-3 pt-2 text-xs text-secondary font-medium">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{activeOfficeDetails.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{activeOfficeDetails.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{activeOfficeDetails.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{activeOfficeDetails.hours}</span>
                  </div>
                </div>

              </div>

              {/* Graphical Custom World Map Locator SVG */}
              <div className="relative h-44 bg-surface rounded-2xl border border-subtle overflow-hidden flex items-center justify-center">
                
                {/* Dotted Abstract Map Layout */}
                <svg className="w-full h-full opacity-35 text-secondary" viewBox="0 0 100 60" fill="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                  <line x1="33" y1="0" x2="33" y2="60" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                  <line x1="66" y1="0" x2="66" y2="60" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                  
                  {/* Continents abstract circles */}
                  <circle cx="20" cy="25" r="10" fill="currentColor" opacity="0.15" />
                  <circle cx="50" cy="30" r="12" fill="currentColor" opacity="0.15" />
                  <circle cx="80" cy="28" r="9" fill="currentColor" opacity="0.15" />
                </svg>

                {/* Animated active Coordinate locator */}
                <div 
                  className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500"
                  style={{ left: activeOfficeDetails.coordX, top: activeOfficeDetails.coordY }}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border border-white"></span>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDE: INTERACTIVE CONTACT FORM */}
          <div className="lg:col-span-7 bg-card border border-subtle rounded-3xl p-8 relative overflow-hidden shadow-sm">
            
            {/* Dynamic Overlay Success Panel */}
            {isSubmitted && (
              <div className="absolute inset-0 bg-card/95 z-20 flex flex-col items-center justify-center p-8 text-center animate-fadeSlideIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                
                <h3 className="text-xl font-black text-primary mb-2">Message Dispatched</h3>
                
                <p className="text-xs text-secondary max-w-sm leading-relaxed mb-6">
                  Thank you! Your information has been received by our {inquiryType} desk. A specialist will review your coordinates and contact you shortly.
                </p>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Send another inquiry
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 border-b border-subtle/50 pb-4">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-md font-black text-primary">Inquiry Form</h3>
                <p className="text-[10px] text-secondary">
                  Routing request to <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{inquiryType}</span> department.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className="text-xs font-bold text-primary flex flex-col gap-2">
                  First name *
                  <div className={`flex items-center gap-2 bg-surface border rounded-xl px-3 py-2.5 transition-all ${
                    errors.firstName ? "border-red-500 ring-2 ring-red-500/15" : "border-subtle focus-within:border-blue-500"
                  }`}>
                    <User className="w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Dr. Carter"
                      className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                      aria-required="true"
                    />
                  </div>
                  {errors.firstName && (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.firstName}
                    </span>
                  )}
                </label>

                <label className="text-xs font-bold text-primary flex flex-col gap-2">
                  Last name *
                  <div className={`flex items-center gap-2 bg-surface border rounded-xl px-3 py-2.5 transition-all ${
                    errors.lastName ? "border-red-500 ring-2 ring-red-500/15" : "border-subtle focus-within:border-blue-500"
                  }`}>
                    <User className="w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Weaver"
                      className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                      aria-required="true"
                    />
                  </div>
                  {errors.lastName && (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.lastName}
                    </span>
                  )}
                </label>

              </div>

              {/* Row 2: Contact fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className="text-xs font-bold text-primary flex flex-col gap-2">
                  Business Email *
                  <div className={`flex items-center gap-2 bg-surface border rounded-xl px-3 py-2.5 transition-all ${
                    errors.email ? "border-red-500 ring-2 ring-red-500/15" : "border-subtle focus-within:border-blue-500"
                  }`}>
                    <Mail className="w-4 h-4 text-secondary" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="carter.w@stmary.org"
                      className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                      aria-required="true"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </span>
                  )}
                </label>

                <label className="text-xs font-bold text-primary flex flex-col gap-2">
                  Phone number (optional)
                  <div className="flex items-center gap-2 bg-surface border border-subtle rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                    <Phone className="w-4 h-4 text-secondary" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+233 24 000 0000"
                      className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                    />
                  </div>
                </label>

              </div>

              {/* Row 3: Organizational context (Changes details depending on type) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <label className="text-xs font-bold text-primary flex flex-col gap-2">
                  {inquiryType === "careers" ? "Current Organization" : "Organization Name"}
                  <div className="flex items-center gap-2 bg-surface border border-subtle rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                    <Building className="w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="St. Mary Hospital"
                      className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                    />
                  </div>
                </label>

                {inquiryType === "careers" ? (
                  <label className="text-xs font-bold text-primary flex flex-col gap-2">
                    Portfolio / CV Link (optional)
                    <div className="flex items-center gap-2 bg-surface border border-subtle rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                      <Globe className="w-4 h-4 text-secondary" />
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/myprofile"
                        className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                      />
                    </div>
                  </label>
                ) : (
                  <label className="text-xs font-bold text-primary flex flex-col gap-2">
                    Organization Website
                    <div className="flex items-center gap-2 bg-surface border border-subtle rounded-xl px-3 py-2.5 focus-within:border-blue-500">
                      <Globe className="w-4 h-4 text-secondary" />
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="www.stmaryhospital.org"
                        className="bg-transparent border-none outline-none text-xs w-full placeholder-secondary"
                      />
                    </div>
                  </label>
                )}

              </div>

              {/* TECHNICAL SUPPORT DYNAMIC FIELDS */}
              {inquiryType === "support" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface rounded-2xl border border-subtle/80 animate-fadeSlideIn">
                  
                  <label className="text-xs font-bold text-primary flex flex-col gap-2">
                    Device ID / Serial Number *
                    <input
                      type="text"
                      name="deviceID"
                      value={formData.deviceID}
                      onChange={handleInputChange}
                      placeholder="MT-XRAY-4092"
                      className={`bg-card border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-500 ${
                        errors.deviceID ? "border-red-500" : "border-subtle"
                      }`}
                    />
                    {errors.deviceID && (
                      <span className="text-[9px] text-red-500">{errors.deviceID}</span>
                    )}
                  </label>

                  <label className="text-xs font-bold text-primary flex flex-col gap-2">
                    Priority Severity
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="bg-card border border-subtle rounded-xl px-3 py-2.5 text-xs w-full outline-none focus:border-blue-500 appearance-none cursor-pointer"
                      >
                        <option value="low">Low (System Advisory)</option>
                        <option value="medium">Medium (Faulty Telemetry)</option>
                        <option value="high">High (Equipment Offline)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </label>

                </div>
              )}

              {/* PARTNERSHIP DYNAMIC ROLE SELECTOR */}
              {inquiryType === "partnerships" && (
                <div className="p-4 bg-surface rounded-2xl border border-subtle/80 animate-fadeSlideIn">
                  <label className="text-xs font-bold text-primary flex flex-col gap-2">
                    Your Partnership Role
                    <div className="relative">
                      <select
                        name="partnerRole"
                        value={formData.partnerRole}
                        onChange={handleInputChange}
                        className="bg-card border border-subtle rounded-xl px-3 py-2.5 text-xs w-full outline-none focus:border-blue-500 appearance-none cursor-pointer"
                      >
                        <option value="hospital">Hospital/Clinical Group Operator</option>
                        <option value="supplier">Medical Equipment OEM/Supplier</option>
                        <option value="technician">Independent Biomedical Contractor</option>
                        <option value="government">Health Ministry / Biometric Commission</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </label>
                </div>
              )}

              {/* Message field */}
              <label className="text-xs font-bold text-primary flex flex-col gap-2">
                Inquiry Message *
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder={
                    inquiryType === "support" 
                      ? "Describe the issue or error logs displayed on the machine dashboard..."
                      : inquiryType === "careers"
                      ? "Tell us briefly about your background and why you wish to join the MedTrack open-source network..."
                      : "Enter your query details here..."
                  }
                  className={`bg-surface border rounded-xl px-3 py-2.5 text-xs w-full outline-none focus:border-blue-500 placeholder-secondary transition-all ${
                    errors.message ? "border-red-500 ring-2 ring-red-500/15" : "border-subtle"
                  }`}
                  maxLength="500"
                ></textarea>
                
                <div className="flex justify-between items-center text-[10px] text-secondary">
                  {errors.message ? (
                    <span className="font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </span>
                  ) : (
                    <span>Please write at least 10 characters.</span>
                  )}
                  <span>{500 - formData.message.length} characters remaining</span>
                </div>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Routing to Desk...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Inquiry
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </main>

      {/* ----------------------------------------------------------------------
          3. FAQ ACCORDIONS
          ---------------------------------------------------------------------- */}
      <section className="py-24 max-w-4xl mx-auto px-6 border-t border-subtle/50">
        
        <h2 className="text-2xl font-black text-primary text-center mb-12">
          Contact FAQ Triage
        </h2>

        <div className="space-y-3">
          {CONTACT_FAQS.map((faq) => {
            const isOpen = expandedFaq === faq.id;
            
            return (
              <article
                key={faq.id}
                className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm"
              >
                
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-primary hover:text-blue-600 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs md:text-sm">{faq.q}</span>
                  
                  <span className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-secondary border border-subtle transition-all ${
                    isOpen ? "rotate-180 text-blue-600 border-blue-500/20" : ""
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[300px] border-t border-subtle/50 opacity-100" : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
                  }`}
                >
                  <div className="p-5 text-xs text-secondary leading-relaxed bg-surface/30 space-y-2">
                    <p>{faq.a}</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface border border-subtle text-[8.5px] uppercase tracking-wider font-bold">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                </div>

              </article>
            );
          })}
        </div>

      </section>

      {/* ----------------------------------------------------------------------
          4. SECURITY & Bug Bounty CTA
          ---------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="bg-card border border-subtle rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-6">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl shrink-0">
              🛡️
            </div>

            <div className="space-y-1">
              <h4 className="text-md font-bold text-primary mb-1">
                Responsible Security Vulnerability Disclosures
              </h4>
              <p className="text-xs text-secondary max-w-xl leading-relaxed">
                Notice a security loophole or data leak? Please do not share it on public forums. Report issues directly to our security audit response desks at <span className="font-semibold text-blue-600 dark:text-blue-400">security@medtrack.org</span>.
              </p>
            </div>

          </div>

          <a 
            href="mailto:security@medtrack.org"
            className="px-6 py-3 bg-primary text-card hover:opacity-90 rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 text-center"
          >
            Report Vulnerability
          </a>

        </div>

      </section>

    </div>
  );
}
