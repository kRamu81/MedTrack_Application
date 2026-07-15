import { useState } from "react";

/**
 * HelpPage Component
 * 
 * Provides interactive documentation and FAQs for the MedTrack application.
 * Supports searching FAQs, filtering by categories, and expanding/collapsing FAQ items.
 */
export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // FAQ Categories metadata
  const categories = [
    { id: "all", label: "All Topics", icon: "📋" },
    { id: "getting-started", label: "Getting Started", icon: "🚀" },
    { id: "roles", label: "Roles & Access", icon: "🔑" },
    { id: "maintenance", label: "Maintenance Tasks", icon: "🛠️" },
    { id: "equipment", label: "Equipment & QR Codes", icon: "🏷️" },
    { id: "troubleshooting", label: "Troubleshooting", icon: "🔍" },
  ];

  // FAQ list with questions, answers, and tags
  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I setup my MedTrack account?",
      answer: "To get started with MedTrack, click 'Sign In' or 'Register' in the navigation bar. You will need to choose your organization role (Hospital, Technician, or Supplier). After filling out the registration form, verify your email using the OTP sent to your mailbox to activate your account."
    },
    {
      id: 2,
      category: "roles",
      question: "What are the differences between Hospital, Technician, and Supplier roles?",
      answer: "Hospitals have full administrative control: they can add/edit medical equipment, schedule maintenance tasks, and view analytics. Technicians can view tasks assigned to them and update their status. Suppliers receive equipment order requests and manage shipments."
    },
    {
      id: 3,
      category: "maintenance",
      question: "How can I schedule maintenance for an equipment asset?",
      answer: "As a Hospital Admin, navigate to the 'Equipment' page, find the equipment in your list, and select 'Schedule Maintenance'. Alternatively, go directly to the 'Maintenance' calendar and click 'Schedule Task', filling in the asset details, priority level, and assigned technician."
    },
    {
      id: 4,
      category: "equipment",
      question: "What is the QR Code feature, and how does it work?",
      answer: "Every piece of medical equipment in MedTrack receives a unique QR Code. You can print this code and attach it physically to the equipment. Scanning the QR Code instantly redirects users to the asset details page, enabling rapid checks of maintenance history and specifications."
    },
    {
      id: 5,
      category: "troubleshooting",
      question: "Why am I seeing an Access Denied / 403 Forbidden screen?",
      answer: "MedTrack enforces Role-Based Access Control (RBAC). If you attempt to access a route or API endpoint not permitted for your role (for example, a technician trying to delete equipment), you will be redirected to an unauthorized page. Please contact your administrator if you believe this is an error."
    },
    {
      id: 6,
      category: "getting-started",
      question: "How do I export my maintenance schedule?",
      answer: "You can download your entire maintenance schedule in standard RFC-5545 iCalendar (.ics) format. Navigate to the Maintenance Schedule page and click the 'Export to iCal' button. This file can be imported into Google Calendar, Microsoft Outlook, or Apple Calendar."
    }
  ];

  // Filter FAQs based on active category tab and search query
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600/10 via-transparent to-transparent border-b border-subtle">
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
            Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-4 mb-6 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-md text-secondary max-w-xl mx-auto mb-8">
            Find answers to frequently asked questions, learn about system roles, and explore detailed guides on equipment management.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
              <svg className="w-5 h-5 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search help topics, FAQs, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card text-primary placeholder-secondary border border-subtle rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-md shadow-black/[0.02]"
            />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Tabs: Categories */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary px-3 mb-4">
              Categories
            </h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-1.5 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedFaqId(null);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 w-full text-left ${
                    activeCategory === cat.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15 scale-[1.02]"
                      : "bg-card text-secondary hover:bg-hover hover:text-primary border border-subtle"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section: FAQ Accordions */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">
              Frequently Asked Questions
            </h3>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                  >
                    {/* Accordion Trigger Header */}
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-primary hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <span className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-secondary border border-subtle transition-transform duration-200 ${
                        expandedFaqId === faq.id ? "rotate-180 text-blue-600 border-blue-500/20" : ""
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>

                    {/* Accordion Content Panel */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        expandedFaqId === faq.id
                          ? "max-h-[500px] border-t border-subtle/50 opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="p-5 text-[14px] text-secondary leading-relaxed bg-surface/30">
                        {faq.answer}
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
                <h4 className="text-lg font-bold text-primary mb-2">No matching topics found</h4>
                <p className="text-sm text-secondary max-w-sm mx-auto">
                  We couldn't find any results matching "{searchQuery}". Try broadening your search or choosing another category.
                </p>
              </div>
            )}

            {/* Guide Card Widget */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white mt-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 max-w-md">
                <h4 className="text-xl font-bold mb-2">Need direct assistance?</h4>
                <p className="text-blue-100 text-xs mb-6 leading-relaxed">
                  Our technical support and operations assistance teams are available to help you troubleshoot device connectivity, seeding, and inventory management.
                </p>
                <button
                  onClick={() => window.location.href = "mailto:support@medtrack.org"}
                  className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Contact Support Team
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
