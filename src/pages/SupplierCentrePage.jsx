import { useState } from "react";

/**
 * SupplierCentrePage Component
 * 
 * Showcases the features, benefits, and support systems available to medical vendors
 * on the MedTrack Supplier Network. Includes feature grids, registration CTAs,
 * and supplier-specific FAQs.
 */
export default function SupplierCentrePage({ onNavigate }) {
  const [activeFaqId, setActiveFaqId] = useState(null);

  // Features list
  const features = [
    {
      title: "Real-time RFQ & Orders",
      desc: "Receive digitized procurement orders and request-for-quotes instantly from authorized clinic and hospital networks.",
      icon: "⚡"
    },
    {
      title: "Automated Invoice Generation",
      desc: "Generate professional billing records and PDF invoices directly within the portal upon order dispatch.",
      icon: "📄"
    },
    {
      title: "Logistics Tracking telemetry",
      desc: "Input courier tracking numbers and update transit status so hospital clients can check delivery estimation.",
      icon: "🚚"
    },
    {
      title: "Secure Settlement & Compliance",
      desc: "Get verified faster with our standard compliance checklists adhering to international clinical supplier standards.",
      icon: "🛡️"
    }
  ];

  // Supplier FAQs
  const faqs = [
    {
      id: 1,
      q: "Is there a fee to register as a MedTrack supplier?",
      a: "No, registering a basic supplier profile is free of charge. You can receive procurement orders and input shipment tracking without subscription fees."
    },
    {
      id: 2,
      q: "How do hospital clients pay for invoices?",
      a: "Invoices generated on MedTrack are settled directly via the hospital's preferred payment gateway (mobile money, bank wire, or cards). MedTrack logs payment updates for audit tracking."
    },
    {
      id: 3,
      q: "What certifications are required to supply clinical equipment?",
      a: "All vendors must upload registration credentials, local health ministry clearances, or ISO certificates to establish verified status on the platform."
    }
  ];

  const toggleFaq = (id) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      
      {/* Hero Header */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-b border-subtle">
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
            MedTrack Supplier Network
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary mt-5 mb-6 tracking-tight">
            Empower Your Medical Sales
          </h1>
          <p className="text-md text-secondary max-w-xl mx-auto leading-relaxed">
            Connect directly with verified hospitals, streamline order logistics, generate instant invoices, and track device deliveries.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onNavigate("register", "Supplier")}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/15"
            >
              Register Free Profile
            </button>
            <a
              href="#features"
              className="px-6 py-3 bg-card border border-subtle text-secondary hover:text-primary font-bold rounded-2xl transition-all"
            >
              Explore Benefits
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Features Grid */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-primary mb-3">
            Why Suppliers Partner with MedTrack
          </h2>
          <p className="text-sm text-secondary max-w-md mx-auto">
            Our specialized medical procurement dashboard eliminates coordination headaches and manual spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-card border border-subtle rounded-3xl p-8 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-surface rounded-2xl border border-subtle flex items-center justify-center text-xl mb-5">
                {feat.icon}
              </div>
              <h3 className="text-md font-bold text-primary mb-2">
                {feat.title}
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-6 py-12 border-t border-subtle/50">
        <h2 className="text-xl font-black text-primary mb-8 text-center">
          Supplier Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card border border-subtle rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-primary hover:text-blue-600 transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-secondary border border-subtle transition-transform duration-200 ${
                  activeFaqId === faq.id ? "rotate-180 text-blue-600 border-blue-500/20" : ""
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          ))}
        </div>
      </section>

      {/* Final Register CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white text-center relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-3">Scale Your Client Outreach Today</h3>
            <p className="text-blue-100 text-xs mb-8 leading-relaxed">
              Registering takes less than 5 minutes. Start receiving digitized orders and request-for-quotes immediately.
            </p>
            <button
              onClick={() => onNavigate("register", "Supplier")}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-md"
            >
              Get Started as Supplier
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
