import React, { useState } from "react";

export default function LandingPage({ onNavigate }) {
  const [activePersona, setActivePersona] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const defaultHeroState = {
    heroImg: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&h=1600&q=80",
    subtext: "MedTrack connects hospitals, technicians, and suppliers in one unified platform — ensuring zero downtime, complete traceability, and optimized equipment lifecycles.",
    badge: "Unified Platform",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  };

  const personas = [
    {
      id: "hospital",
      label: "Hospital Admin",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&h=100&q=80",
      heroImg: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&h=1600&q=80",
      subtext: "Monitor hospital equipment, schedule maintenance, and manage supplier orders from a central dashboard.",
      badge: "Hospital Management",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    {
      id: "technician",
      label: "Technician",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=100&h=100&q=80",
      heroImg: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=1600&q=80",
      subtext: "Access maintenance assignments, update task status, and record service details for efficient equipment support.",
      badge: "Maintenance Portal",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    },
    {
      id: "supplier",
      label: "Supplier",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100&q=80",
      heroImg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=1600&q=80",
      subtext: "Process equipment orders, manage inventory levels, and coordinate deliveries to healthcare facilities.",
      badge: "Supplier Network",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      )
    }
  ];

  const currentHero = activePersona !== null ? personas[activePersona] : defaultHeroState;

  const features = [
    {
      img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "Live Analytics",
      title: "Real-Time Equipment Dashboards",
      desc: "Monitor equipment health, track maintenance trends, and view operational KPIs from clinical device sensors."
    },
    {
      img: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "Maintenance Scheduling",
      title: "Automated Work Orders",
      desc: "Keep equipment running smoothly with predictive scheduling and automated technician dispatches for regular servicing."
    },
    {
      img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "Supplier Integration",
      title: "Supplier Order Tracking",
      desc: "Process new orders, track part deliveries, and manage your inventory stock with real-time supplier synchronization."
    },
    {
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&h=900&q=80",
      badge: "Compliance & Security",
      title: "HIPAA Compliant Reporting",
      desc: "Ensure enterprise-grade security with role-based access control, full audit trails, and automated compliance reports."
    }
  ];

  const stats = [
    { value: "500+", label: "Hospitals Served" },
    { value: "12,000+", label: "Devices Tracked" },
    { value: "99.8%", label: "Uptime SLA" },
    { value: "40%", label: "Downtime Reduced" },
  ];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % features.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  // Keyboard support for carousel
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "ArrowLeft") handlePrevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Swipe support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNextSlide();
    if (distance < -minSwipeDistance) handlePrevSlide();
  };

  return (
    <div className="bg-surface text-primary font-sans min-h-screen selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section (Asymmetric) */}
      <section className="relative w-full pt-12 pb-16 lg:pt-8 lg:pb-0 overflow-hidden bg-card rounded-b-[40px] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Typography & CTAs */}
          <div className="flex flex-col justify-center order-2 lg:order-1 pt-8 lg:pt-0 z-10 lg:pr-8">
            
            {/* Persona Switcher (Horizontal Row) */}
            <div className="flex items-center flex-wrap gap-4 mb-8 bg-surface p-2 rounded-[2rem] w-fit border border-subtle">
              {personas.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    activePersona === idx ? "bg-card shadow-sm ring-1 ring-gray-200" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Switch to ${p.label} view`}
                >
                  <img src={p.avatar} alt={`${p.label} Avatar`} width="32" height="32" className="w-8 h-8 rounded-full object-cover border border-subtle" />
                  <span className={`text-sm font-semibold ${activePersona === idx ? "text-primary" : "text-secondary"}`}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-6 text-primary">
              Keep your <br className="hidden sm:block" /> equipment <br className="hidden sm:block" />
              <span className="text-blue-600">always ready.</span>
            </h1>
            
            {/* Dynamic Subtext with Crossfade */}
            <div className="relative min-h-[80px] mb-10">
              <p key={activePersona} className="text-lg sm:text-xl text-secondary max-w-lg leading-relaxed font-medium animate-fadeSlideIn">
                {currentHero.subtext}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("register")}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full hover:bg-blue-700 transition-transform transform hover:-translate-y-0.5 shadow-xl shadow-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Get Started Free
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="px-8 py-4 bg-hover text-primary text-lg font-bold rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Side: Large Lifestyle Photo */}
          <div className="relative order-1 lg:order-2 h-[350px] sm:h-[500px] lg:h-[800px] w-full rounded-[40px] overflow-hidden shadow-2xl bg-hover">
            <img 
              key={activePersona}
              src={currentHero.heroImg} 
              alt="Medical Professional using MedTrack" 
              className="w-full h-full object-cover animate-fadeSlideIn"
            />
            
            {/* Overlapping Badge */}
            <div key={`${activePersona}-badge`} className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-xl flex items-center gap-3 sm:gap-4 animate-fadeSlideIn">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {currentHero.icon}
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-secondary font-bold uppercase tracking-wider">Module Active</p>
                <p className="text-xs sm:text-sm font-bold text-primary">{currentHero.badge}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full bg-blue-600 py-3 sm:py-4 overflow-hidden shadow-inner flex relative z-0">
        <div className="whitespace-nowrap flex animate-marquee">
          {/* Repeat text multiple times to ensure seamless infinite scroll */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center text-white/90 font-bold text-lg sm:text-xl uppercase tracking-widest mx-2 sm:mx-4">
              <span>Hospitals</span><span className="mx-4 sm:mx-8 opacity-50">•</span>
              <span>Technicians</span><span className="mx-4 sm:mx-8 opacity-50">•</span>
              <span>Suppliers</span><span className="mx-4 sm:mx-8 opacity-50">•</span>
              <span>Compliance</span><span className="mx-4 sm:mx-8 opacity-50">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-subtle">
            {stats.map((s) => (
              <div key={s.label} className="px-2 sm:px-4">
                <p className="text-4xl sm:text-5xl md:text-6xl font-black text-primary mb-2 tracking-tighter">{s.value}</p>
                <p className="text-secondary font-semibold uppercase tracking-wider text-xs sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slideshow Features Section */}
      <section className="py-16 sm:py-24 bg-card relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 sm:mb-6 leading-tight tracking-tight">
                Everything your facility needs.
              </h2>
              <p className="text-lg sm:text-xl text-secondary font-medium">
                A complete toolkit for managing the full lifecycle of medical equipment — from procurement to disposal.
              </p>
            </div>
            
            {/* Slideshow Controls */}
            <div className="flex items-center gap-4 sm:gap-6 mt-6 md:mt-0">
              <div className="flex items-center gap-2">
                <button aria-label="Previous Slide" onClick={handlePrevSlide} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-subtle flex items-center justify-center text-gray-600 hover:bg-surface hover:border-blue-600 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button aria-label="Next Slide" onClick={handleNextSlide} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-subtle flex items-center justify-center text-gray-600 hover:bg-surface hover:border-blue-600 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-300 tracking-widest">
                <span className="text-primary">0{activeSlide + 1}</span> / 0{features.length}
              </div>
            </div>
          </div>

          {/* Active Slide Card */}
          <div 
            className="relative w-full h-[450px] lg:h-[600px] rounded-[30px] sm:rounded-[40px] overflow-hidden bg-hover group cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndEvent}
          >
            <img 
              key={activeSlide}
              src={features[activeSlide].img} 
              alt={features[activeSlide].title}
              width="1600"
              height="900"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-fadeSlideIn"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 lg:p-16 max-w-3xl">
              <span className="inline-block bg-blue-600 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm tracking-wider uppercase">
                {features[activeSlide].badge}
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
                {features[activeSlide].title}
              </h3>
              <p className="text-lg sm:text-xl text-gray-200 font-medium leading-relaxed">
                {features[activeSlide].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Portals */}
      <section className="py-20 sm:py-24 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 sm:mb-6 tracking-tight">Built for every stakeholder</h2>
            <p className="text-lg sm:text-xl text-secondary font-medium">Three tailored portals. One unified system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {personas.map((p) => (
              <div key={p.id} className="bg-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-sm border border-subtle hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-blue-600 transition-colors duration-300">
                  <div className="text-blue-600 group-hover:text-white transition-colors duration-300">
                    {p.icon}
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-primary mb-3 sm:mb-4">{p.label} Portal</h3>
                <p className="text-secondary font-medium leading-relaxed mb-8 sm:mb-10 flex-grow">
                  {p.subtext}
                </p>

                <button
                  onClick={() => onNavigate("login")}
                  className="w-full py-3 sm:py-4 bg-surface text-primary font-bold rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-subtle hover:border-blue-200"
                >
                  Login as {p.label.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oversized Closing CTA */}
      <section className="py-24 sm:py-32 bg-card text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 sm:mb-8 leading-none">
            Ready to <br className="hidden sm:block" /> <span className="text-blue-600">transform</span> <br className="hidden sm:block" /> your workflow?
          </h2>
          <p className="text-xl sm:text-2xl text-secondary font-medium mb-10 sm:mb-12 max-w-2xl mx-auto">
            Join hundreds of hospitals already using MedTrack to reduce downtime and cut costs.
          </p>
          <button
            onClick={() => onNavigate("register")}
            className="px-10 py-5 sm:px-12 sm:py-6 bg-surface text-white text-xl sm:text-2xl font-black rounded-full hover:bg-blue-600 transition-colors shadow-2xl"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Unsplash Attribution Footer */}
      <footer className="bg-surface py-6 text-center border-t border-subtle">
        <p className="text-xs sm:text-sm text-secondary font-medium">
          Images provided by incredible photographers on <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 underline decoration-gray-300 hover:decoration-blue-600 transition-colors">Unsplash</a>.
        </p>
      </footer>
    </div>
  );
}
