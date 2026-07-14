import { useState, useRef, useEffect } from "react";

/**
 * @typedef {Object} FAQItem
 * @property {number} id - Unique identifier
 * @property {string} category - Topic category (general, hospitals, technicians, suppliers)
 * @property {string} q - The question text
 * @property {string} a - The detailed answer text
 */

/**
 * @typedef {Object} VideoItem
 * @property {string} title - Tutorial title
 * @property {string} duration - Video duration (MM:SS)
 * @property {string} views - Number of views
 * @property {string} description - Summary of contents
 * @property {string} category - Matching filter category
 */

/**
 * @typedef {Object} SupportTicket
 * @property {string} id - Auto-generated ticket reference (e.g. TK-123456)
 * @property {string} name - User's name
 * @property {string} email - Enterprise contact email
 * @property {string} org - Registered healthcare organization or vendor name
 * @property {string} priority - Priority level (Low, Medium, High, Critical)
 * @property {string} category - Department category
 * @property {string} subject - Brief summary of request
 * @property {string} message - Full detailed description
 * @property {string} date - Timestamp of submission
 * @property {string} status - Current status in operational lifecycle
 * @property {Array<{sender: string, text: string, time: string}>} conversation - Agent-user message log
 */

// ==========================================
// STATIC DATA DEFINITIONS
// ==========================================

/** @type {FAQItem[]} */
const FAQ_ITEMS = [
  {
    id: 1,
    category: "general",
    q: "How do I reset my account password?",
    a: "Locate the login page and click 'Forgot Password'. Provide your registered enterprise email address, and the system will send you a verification OTP. Enter this OTP on screen to securely set your new password."
  },
  {
    id: 2,
    category: "hospitals",
    q: "How do I print physical QR codes for new equipment?",
    a: "Navigate to the 'Equipment' page from the dashboard menu. Click on the asset you wish to tag, then click 'Download QR Code' to generate a print-ready PNG file. You can attach this tag to the physical device for scanner tracking."
  },
  {
    id: 3,
    category: "technicians",
    q: "How do I claim and update status on maintenance tickets?",
    a: "Go to the 'My Tasks' panel on your sidebar dashboard. Select any open ticket, read its priority level, and click 'Start Task' to change the status to 'In Progress'. When servicing is complete, input your maintenance resolution notes and click 'Complete'."
  },
  {
    id: 4,
    category: "suppliers",
    q: "Where do I submit shipment tracking numbers?",
    a: "Open your 'Orders' list. Select the pending procurement request, click the 'Dispatch Shipment' button, enter the shipping carrier details and tracking code, and click 'Submit' to send telemetry updates to the client hospital."
  },
  {
    id: 5,
    category: "general",
    q: "Can I manage multiple medical facilities from one account?",
    a: "Single hospital admin profiles are restricted to one facility. If your organization manages multi-site logistics, contact our support team to upgrade your profile to a Multi-facility Organization license."
  },
  {
    id: 6,
    category: "hospitals",
    q: "How do I perform bulk inventory updates?",
    a: "Go to the 'Equipment' tab, click 'Add Equipment' and choose the 'Import CSV' option. Download our pre-formatted template, fill in details like serial numbers and model names, and upload the completed sheet."
  },
  {
    id: 7,
    category: "technicians",
    q: "How do I log spare parts used during maintenance?",
    a: "When resolving a task, the resolution modal contains a 'Spare Parts' section. Click 'Add Part', search the inventory database by item code or description, specify the quantity consumed, and save the task log."
  },
  {
    id: 8,
    category: "suppliers",
    q: "How do I generate and download invoice PDFs?",
    a: "After marking an order as 'Dispatched' or 'Delivered', click on the order record and select 'Generate Invoice'. Review the pre-populated values, click 'Save PDF', and it will automatically be attached to the client order stream."
  },
  {
    id: 9,
    category: "general",
    q: "Is multi-factor authentication (MFA) supported?",
    a: "Yes, MedTrack enforces multi-factor authentication for all active accounts. During initial setup, you will register your phone number to receive secure login verification codes."
  },
  {
    id: 10,
    category: "hospitals",
    q: "What does the 'Critical Downtime Alert' indicator mean?",
    a: "The critical indicator triggers when high-priority clinical equipment (e.g. ventilators, ICU monitors) is offline or overdue for preventive maintenance, signaling administrators to expedite task assignments."
  }
];

/** @type {VideoItem[]} */
const TUTORIAL_VIDEOS = [
  {
    title: "Onboarding Your Hospital Facility",
    duration: "4:15",
    views: "1.2k views",
    description: "Quick walkthrough on importing bulk inventories and configuring initial department assignments.",
    category: "hospitals"
  },
  {
    title: "Sensor Calibration Walkthrough",
    duration: "6:40",
    views: "850 views",
    description: "Step-by-step telemetry guides showing technicians how to calibrate diagnostic machines.",
    category: "technicians"
  },
  {
    title: "Managing Vendor Shipping Boards",
    duration: "3:20",
    views: "520 views",
    description: "Brief dashboard walkthrough showing suppliers how to fulfill orders and update courier metadata.",
    category: "suppliers"
  },
  {
    title: "MFA & Security Auditing Settings",
    duration: "2:50",
    views: "940 views",
    description: "Learn how to activate backup emergency codes, audit log files, and adjust secure login settings.",
    category: "general"
  },
  {
    title: "CSV Inventory Imports",
    duration: "5:10",
    views: "1.1k views",
    description: "Avoid spreadsheet format issues. Tips and templates for bulk seeding massive clinic catalogs.",
    category: "hospitals"
  },
  {
    title: "Logging System Failures",
    duration: "4:30",
    views: "620 views",
    description: "A deep dive for technicians on logging firmware error logs and diagnostic hardware codes.",
    category: "technicians"
  }
];

// ==========================================
// CHATBOT KEYWORD MATCHING DICTIONARY
// ==========================================
const CHATBOT_RESPONSES = {
  status: "All MedTrack database nodes (EU, US, IN) are currently operational. Average latency: 45ms. Security status: Clear.",
  qr: "To download or print QR codes, open the 'Equipment' page, choose your device entry, and click the 'Download QR Code' button.",
  password: "To reset your password, visit the login interface, click 'Forgot Password', and enter your email to receive a secure password OTP.",
  order: "Suppliers can track and dispatch orders inside the 'Orders' dashboard by clicking 'Dispatch Shipment' and inputting tracking IDs.",
  task: "Technicians should go to 'My Tasks', select a maintenance ticket, select 'Start Task', and set the ticket to 'Completed' when done.",
  contact: "Our emergency clinical helpdesk is available 24/7 at +1 (800) 555-0199 or email us at support@medtrack.org.",
  default: "I'm not sure about that. Try typing keywords like 'status', 'password', 'qr code', 'orders', or 'tasks' for quick guidance."
};

/**
 * HelpPage Component
 * 
 * Provides an advanced, high-fidelity help workspace supporting:
 * - Search bar with recommendation chips.
 * - Tab-categorized expandable FAQ database.
 * - Interactive multi-ticket tracker with timeline visualizations and message logs.
 * - Live-typing Chat simulator recognizing custom messages and keyword matches.
 * - Grid of video tutorials filtered by user role.
 */
export default function HelpPage({ onNavigate }) {
  // Navigation, Search & FAQ states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFaqId, setActiveFaqId] = useState(null);

  // Ticket submission states
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketOrg, setTicketOrg] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketCategory, setTicketCategory] = useState("Inventory Management");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  
  /** @type {[SupportTicket[], React.Dispatch<React.SetStateAction<SupportTicket[]>>]} */
  const [submittedTickets, setSubmittedTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Chat simulator states
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you with MedTrack today?", time: "Just now" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat window when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  /**
   * Filter FAQs based on category chips and search queries
   */
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /**
   * Filter Tutorial Videos based on category chips
   */
  const filteredVideos = TUTORIAL_VIDEOS.filter((video) => {
    return selectedCategory === "all" || video.category === selectedCategory;
  });

  /**
   * Toggles active accordion state for FAQs
   * @param {number} id 
   */
  const toggleFaq = (id) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  /**
   * Handle Support Ticket Form Submission
   * @param {React.FormEvent} e 
   */
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketSubject || !ticketMessage) return;

    const newTicket = {
      id: `TK-${Math.floor(100000 + Math.random() * 900000)}`,
      name: ticketName,
      email: ticketEmail,
      org: ticketOrg || "N/A",
      priority: ticketPriority,
      category: ticketCategory,
      subject: ticketSubject,
      message: ticketMessage,
      date: new Date().toLocaleDateString(),
      status: "Submitted",
      conversation: [
        {
          sender: "system",
          text: `Support ticket registered successfully under category: ${ticketCategory}. Priority level set to ${ticketPriority}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSubmittedTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);

    // Reset Form Fields
    setTicketName("");
    setTicketEmail("");
    setTicketOrg("");
    setTicketPriority("Medium");
    setTicketCategory("Inventory Management");
    setTicketSubject("");
    setTicketMessage("");
  };

  /**
   * Allows the user to reply back to agents on their active ticket log
   * @param {string} ticketId 
   */
  const handleAddComment = (ticketId) => {
    if (!newCommentText.trim()) return;

    setSubmittedTickets((prevTickets) =>
      prevTickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            conversation: [
              ...t.conversation,
              {
                sender: "user",
                text: newCommentText.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return t;
      })
    );

    setNewCommentText("");

    // Simulate a mock agent follow-up reply after a brief timeout
    setTimeout(() => {
      setSubmittedTickets((prevTickets) =>
        prevTickets.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              status: "Under Review",
              conversation: [
                ...t.conversation,
                {
                  sender: "agent",
                  text: "Thank you for the update. Our clinical hardware team is reviewing your log files and will update this timeline shortly.",
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            };
          }
          return t;
        })
      );
    }, 1500);
  };

  /**
   * Simulates Chat Assistant keyword responses
   * @param {string} customText 
   */
  const triggerChatBotReply = (customText) => {
    const textLower = customText.toLowerCase();
    let matchedReply = CHATBOT_RESPONSES.default;

    if (textLower.includes("status") || textLower.includes("server") || textLower.includes("online")) {
      matchedReply = CHATBOT_RESPONSES.status;
    } else if (textLower.includes("qr") || textLower.includes("code") || textLower.includes("print")) {
      matchedReply = CHATBOT_RESPONSES.qr;
    } else if (textLower.includes("pass") || textLower.includes("reset") || textLower.includes("forgot")) {
      matchedReply = CHATBOT_RESPONSES.password;
    } else if (textLower.includes("order") || textLower.includes("shipping") || textLower.includes("supplier")) {
      matchedReply = CHATBOT_RESPONSES.order;
    } else if (textLower.includes("task") || textLower.includes("technician") || textLower.includes("maintenance")) {
      matchedReply = CHATBOT_RESPONSES.task;
    } else if (textLower.includes("contact") || textLower.includes("phone") || textLower.includes("support")) {
      matchedReply = CHATBOT_RESPONSES.contact;
    }

    setChatMessages((prev) => [...prev, { sender: "user", text: customText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: matchedReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleChatFormSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    triggerChatBotReply(chatInput.trim());
  };

  const activeTicket = submittedTickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="bg-surface min-h-screen font-sans pb-24">
      
      {/* Hero Header Banner */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-b border-subtle">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:45px_45px]"></div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full">
            Help Center & Support Desk
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-5 mb-6 tracking-tight">
            How can we help you?
          </h1>
          
          {/* Main Search Widget */}
          <div className="relative max-w-xl mx-auto group mb-4">
            <input
              type="text"
              placeholder="Search help topics, FAQs, templates, and walkthroughs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card text-primary placeholder-secondary border border-subtle rounded-2xl py-4.5 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-md"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary">
              <svg className="w-5 h-5 transition-colors group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Recommended Filter Tags */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4 text-xs text-secondary font-medium">
            <span>Recommended tags:</span>
            {["QR codes", "Password OTP", "Invoices", "Calibration", "CSV Import"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="bg-card hover:bg-hover border border-subtle px-3 py-1 rounded-xl transition-all"
              >
                {tag}
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-red-500 font-bold hover:underline ml-2"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Horizontal Category Selector Chips */}
        <div className="flex overflow-x-auto gap-2 pb-5 border-b border-subtle/50 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveFaqId(null);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
                  : "bg-card text-secondary hover:bg-hover hover:text-primary border border-subtle"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT AREA: FAQs, Videos, and Ticket Form */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* FAQ List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight text-primary">Frequently Asked Questions</h3>
                <span className="text-xs text-secondary font-semibold">
                  Showing {filteredFaqs.length} of {FAQ_ITEMS.length} items
                </span>
              </div>

              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-primary hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        <span className="text-sm leading-snug">{faq.q}</span>
                        <span className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-secondary border border-subtle transition-transform duration-200 shrink-0 ${
                          activeFaqId === faq.id ? "rotate-180 text-blue-600 border-blue-500/20" : ""
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          activeFaqId === faq.id
                            ? "max-h-[300px] border-t border-subtle/50 opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
                        }`}
                      >
                        <div className="p-5 text-xs text-secondary leading-relaxed bg-surface/30">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card border border-subtle rounded-3xl p-12 text-center">
                    <p className="text-sm text-secondary">No answers found for your query. Try resetting filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Walkthroughs */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-primary">Video Tutorials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video, idx) => (
                    <div
                      key={idx}
                      className="bg-card border border-subtle rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800/55 flex items-center justify-center relative">
                        <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-lg font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
                          ▶
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-4.5">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-md mb-2">
                          {video.category}
                        </span>
                        <h4 className="text-xs font-bold text-primary mb-1 line-clamp-1">{video.title}</h4>
                        <p className="text-[10px] text-secondary mb-2">{video.views}</p>
                        <p className="text-[11px] text-secondary leading-relaxed line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 bg-card border border-subtle rounded-3xl p-8 text-center text-xs text-secondary">
                    No videos available under this category filter.
                  </div>
                )}
              </div>
            </div>

            {/* Support Ticket Submission Form */}
            <div className="space-y-4 pt-6 border-t border-subtle/50">
              <h3 className="text-xl font-bold tracking-tight text-primary">Service Request & Support Tickets</h3>
              <p className="text-xs text-secondary">Can't resolve the issue? Submit a ticket below. You can track status updates and message our operations team directly.</p>

              {/* Tickets List Selector */}
              {submittedTickets.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {submittedTickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedTicketId === t.id
                          ? "bg-blue-500/10 border-blue-500 text-blue-600"
                          : "bg-card border-subtle text-secondary"
                      }`}
                    >
                      Ticket: {t.id} ({t.status})
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface border border-subtle text-secondary hover:text-primary transition-colors"
                  >
                    + New Form
                  </button>
                </div>
              )}

              {selectedTicketId && activeTicket ? (
                // Active Ticket Details & Message Board
                <div className="bg-card border border-subtle rounded-3xl p-8 space-y-6">
                  <div className="flex justify-between items-start flex-wrap gap-4 border-b border-subtle/50 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          activeTicket.priority === "Critical"
                            ? "bg-red-500/10 text-red-600"
                            : activeTicket.priority === "High"
                            ? "bg-orange-500/10 text-orange-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {activeTicket.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold bg-slate-500/10 text-secondary px-2 py-0.5 rounded-md">
                          {activeTicket.status}
                        </span>
                      </div>
                      <h4 className="text-md font-bold text-primary mb-1">{activeTicket.subject}</h4>
                      <p className="text-[11px] text-secondary">
                        Submitted by {activeTicket.name} ({activeTicket.email}) • Org: {activeTicket.org}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-secondary">{activeTicket.id}</span>
                  </div>

                  {/* Message History */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary">Conversation Log</h5>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      <div className="bg-surface/50 border border-subtle/40 rounded-xl p-4 text-xs text-secondary leading-relaxed">
                        <strong className="text-primary block mb-1">Original Issue Description:</strong>
                        {activeTicket.message}
                      </div>

                      {activeTicket.conversation.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl p-4 text-xs leading-relaxed border ${
                            msg.sender === "user"
                              ? "bg-blue-500/5 border-blue-500/10 ml-8 text-secondary"
                              : msg.sender === "agent"
                              ? "bg-emerald-500/5 border-emerald-500/10 mr-8 text-secondary"
                              : "bg-surface border-subtle/40 text-secondary italic"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-primary font-semibold">
                              {msg.sender === "user" ? "You" : msg.sender === "agent" ? "Operations Agent" : "System Alert"}
                            </strong>
                            <span className="text-[10px] text-secondary">{msg.time}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline representation */}
                  <div className="border-t border-subtle/50 pt-5 space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary">Progress Timeline</h5>
                    <div className="flex items-center gap-4 flex-wrap text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                        <span>✓</span> <span>Created</span>
                      </div>
                      <div className="text-secondary">→</div>
                      <div className={`flex items-center gap-1.5 font-semibold ${
                        activeTicket.status !== "Submitted" ? "text-emerald-500" : "text-secondary"
                      }`}>
                        <span>{activeTicket.status !== "Submitted" ? "✓" : "○"}</span>
                        <span>Under Review</span>
                      </div>
                      <div className="text-secondary">→</div>
                      <div className="flex items-center gap-1.5 text-secondary">
                        <span>○</span> <span>Resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Input Form */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add follow-up notes, serial numbers, log file links..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(activeTicket.id)}
                      className="flex-1 bg-surface text-primary border border-subtle rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAddComment(activeTicket.id)}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ) : (
                // Form entry state
                <form onSubmit={handleTicketSubmit} className="bg-card border border-subtle rounded-3xl p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">Enterprise Email</label>
                      <input
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="email@hospital.org"
                        className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">Organization</label>
                      <input
                        type="text"
                        value={ticketOrg}
                        onChange={(e) => setTicketOrg(e.target.value)}
                        placeholder="e.g. St. Mary Hospital"
                        className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">Priority Level</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                      >
                        <option value="Low">Low (General guidance)</option>
                        <option value="Medium">Medium (Operational query)</option>
                        <option value="High">High (Device downtime)</option>
                        <option value="Critical">Critical (System-wide outage)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-2">Issue Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                      >
                        <option value="Inventory Management">Inventory & QR Seeding</option>
                        <option value="Task System">Technician Maintenance Tasks</option>
                        <option value="Shipment Procurement">Procurement Order Shipments</option>
                        <option value="Account Settings">Access & Security Settings</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. QR code export template fails to load model details"
                      className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-2">Problem Description</label>
                    <textarea
                      required
                      rows={5}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Detail your request, equipment model numbers, error outputs, or timeline constraints..."
                      className="w-full bg-surface text-primary border border-subtle rounded-xl px-4 py-3.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xs transition-colors"
                  >
                    Open Support Request
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* RIGHT AREA: Support contacts & Live Chat Simulator */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Chat Simulator */}
            <div className="bg-card border border-subtle rounded-[2rem] p-6 shadow-sm flex flex-col h-[480px]">
              
              {/* Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-subtle/50 mb-4 shrink-0">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-bold text-primary">MedTrack Chatbot Assistant</h4>
                  <span className="text-[9px] text-secondary">Operational Support Guide</span>
                </div>
              </div>

              {/* Message Log */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-surface border border-subtle text-secondary"
                    }`}>
                      {msg.text}
                      {msg.time && (
                        <span className="block text-[8px] opacity-75 mt-1 text-right">{msg.time}</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface border border-subtle rounded-2xl px-4 py-2 text-secondary italic animate-pulse">
                      Typing response...
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Option suggestions for quick clicks */}
              <div className="shrink-0 space-y-1.5 border-t border-subtle/50 pt-4">
                <span className="block text-[9px] text-secondary font-bold mb-1">Quick-click query:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => triggerChatBotReply("Check server status")}
                    className="bg-surface hover:bg-hover border border-subtle rounded-lg px-2.5 py-1 text-[10px] font-semibold text-secondary transition-colors"
                  >
                    🌐 System Status
                  </button>
                  <button
                    onClick={() => triggerChatBotReply("How do I resetting password?")}
                    className="bg-surface hover:bg-hover border border-subtle rounded-lg px-2.5 py-1 text-[10px] font-semibold text-secondary transition-colors"
                  >
                    🔑 Reset Password
                  </button>
                </div>
              </div>

              {/* Chat Form Input */}
              <form onSubmit={handleChatFormSubmit} className="flex gap-1.5 mt-3 pt-2">
                <input
                  type="text"
                  placeholder="Type keyword e.g. status, qr..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-surface text-primary border border-subtle rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3.5 rounded-xl text-xs hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </form>

            </div>

            {/* Quick Contacts */}
            <div className="bg-card border border-subtle rounded-3xl p-6">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-lg mb-4">
                📞
              </div>
              <h4 className="text-sm font-bold text-primary mb-1">Emergency Helpdesk</h4>
              <p className="text-xs text-secondary mb-4">
                Available 24/7 for high-priority clinical system emergencies.
              </p>
              <span className="text-xs font-bold text-green-600 dark:text-green-400">
                +1 (800) 555-0199
              </span>
            </div>

            <div className="bg-card border border-subtle rounded-3xl p-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-lg mb-4">
                ✉️
              </div>
              <h4 className="text-sm font-bold text-primary mb-1">Email Support</h4>
              <p className="text-xs text-secondary mb-4">
                Expect a response from our clinical support agents in under 12 hours.
              </p>
              <a
                href="mailto:support@medtrack.org"
                className="inline-block text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                support@medtrack.org
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
