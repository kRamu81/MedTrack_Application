import React, { useState, useEffect } from "react";

export default function LandingPage({ onNavigate }) {
  const [activeIdeaIndex, setActiveIdeaIndex] = useState(0);

  const searchIdeas = [
    { text: "MRI Machine", color: "text-blue-600" },
    { text: "Hospital Bed", color: "text-emerald-600" },
    { text: "Defibrillator", color: "text-amber-600" },
    { text: "Ventilator", color: "text-indigo-600" },
    { text: "Infusion Pump", color: "text-rose-600" }
  ];

  // Cycle through ideas every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdeaIndex((prev) => (prev + 1) % searchIdeas.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchIdeas.length]);

  // Pinterest-style background images (medical equipment)
  const masonryImages = [
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1584982751601-97d883f510f4?auto=format&fit=crop&w=400&q=80"
  ];

  const features = [
    {
      img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
      title: "Real-Time Tracking",
      desc: "Monitor equipment health and operational KPIs."
    },
    {
      img: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=800&q=80",
      title: "Automated Maintenance",
      desc: "Predictive scheduling and automated technician dispatches."
    },
    {
      img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&h=800&q=80", // Taller aspect ratio for masonry
      title: "Supplier Integration",
      desc: "Process new orders and manage inventory stock."
    },
    {
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      title: "HIPAA Compliant",
      desc: "Role-based access control and full audit trails."
    },
    {
      img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&h=800&q=80", // Taller aspect ratio
      title: "Supplier Portals",
      desc: "Dedicated interfaces for B2B procurement."
    },
    {
      img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      title: "Zero Downtime",
      desc: "Ensure seamless healthcare facility operations."
    }
  ];

  const currentIdea = searchIdeas[activeIdeaIndex];

  return (
    <div className="bg-surface text-primary font-sans min-h-screen selection:bg-blue-600 selection:text-white pb-24">

      {/* Hero Section: Pinterest Masonry Background + Glassdoor Search */}
      <section className="relative w-full h-screen min-h-[700px] bg-surface overflow-hidden flex flex-col items-center justify-center pt-20">
        
        {/* Background Masonry Grid (Animated) */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 select-none pointer-events-none">
          <div className="flex gap-4 p-4 absolute top-0 animate-scroll-up w-full justify-center">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 w-[250px] -mt-24">
              {[...masonryImages, ...masonryImages].map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
              ))}
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-4 w-[250px] mt-12 hidden sm:flex">
              {[...masonryImages.slice(4), ...masonryImages.slice(0, 4), ...masonryImages.slice(4), ...masonryImages.slice(0, 4)].map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
              ))}
            </div>
            {/* Column 3 */}
            <div className="flex flex-col gap-4 w-[250px] -mt-16 hidden lg:flex">
              {[...masonryImages.slice(8), ...masonryImages.slice(0, 8), ...masonryImages.slice(8), ...masonryImages.slice(0, 8)].map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
              ))}
            </div>
             {/* Column 4 */}
             <div className="flex flex-col gap-4 w-[250px] mt-24 hidden xl:flex">
              {[...masonryImages, ...masonryImages].reverse().map((src, i) => (
                <img key={i} src={src} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
              ))}
            </div>
          </div>
          {/* Gradient Overlay to fade out edges and keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface/10" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-[1000px] px-6 text-center">
          
          <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight text-primary leading-tight mb-4">
            Find the right <br/>
            <span key={activeIdeaIndex} className={`inline-block animate-fadeSlideIn ${currentIdea.color}`}>
              {currentIdea.text}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-secondary font-medium mb-10 max-w-2xl mx-auto">
            Discover thousands of medical devices, manage maintenance, and seamlessly connect with top healthcare suppliers.
          </p>

          {/* Glassdoor-Style Central Search Pill */}
          <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-gray-200 flex flex-col sm:flex-row items-center w-full max-w-4xl mx-auto relative group focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            
            {/* Input 1: What */}
            <div className="flex-1 flex items-center w-full px-6 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 group-hover:border-gray-200">
              <svg className="w-6 h-6 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Equipment type, keyword, or serial no." 
                className="w-full bg-transparent border-none outline-none text-lg text-primary placeholder-gray-400 font-medium"
              />
            </div>

            {/* Input 2: Where */}
            <div className="flex-1 flex items-center w-full px-6 py-4">
              <svg className="w-6 h-6 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Hospital, Department, or Ward" 
                className="w-full bg-transparent border-none outline-none text-lg text-primary placeholder-gray-400 font-medium"
              />
            </div>

            {/* Search Button */}
            <button 
              onClick={() => onNavigate("login")}
              className="w-full sm:w-auto mt-2 sm:mt-0 bg-blue-600 text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-blue-700 transition-colors shadow-md sm:ml-2"
            >
              Search
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
            <span className="text-gray-500">Popular:</span>
            {["MRI Scanners", "Ventilators", "Defibrillators", "Surgical Robots"].map((tag) => (
              <span key={tag} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                {tag}
              </span>
            ))}
          </div>
          
        </div>
      </section>

      {/* Trusted By (Floating Marquee) */}
      <section className="border-t border-b border-subtle bg-white py-10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest">Trusted by leading healthcare providers</p>
        </div>
        
        {/* Marquee Container */}
        <div className="flex w-max animate-scroll-left hover:[animation-play-state:paused] opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {[
            { name: "Mayo Clinic", domain: "mayoclinic.org" },
            { name: "Cleveland Clinic", domain: "clevelandclinic.org" },
            { name: "Johns Hopkins", domain: "hopkinsmedicine.org" },
            { name: "Mass General", domain: "massgeneral.org" },
            { name: "UCLA Health", domain: "uclahealth.org" },
            { name: "Stanford Health", domain: "stanfordhealthcare.org" },
            { name: "Mount Sinai", domain: "mountsinai.org" },
            { name: "NYU Langone", domain: "nyulangone.org" },
            // Duplicated for seamless scrolling
            { name: "Mayo Clinic", domain: "mayoclinic.org" },
            { name: "Cleveland Clinic", domain: "clevelandclinic.org" },
            { name: "Johns Hopkins", domain: "hopkinsmedicine.org" },
            { name: "Mass General", domain: "massgeneral.org" },
            { name: "UCLA Health", domain: "uclahealth.org" },
            { name: "Stanford Health", domain: "stanfordhealthcare.org" },
            { name: "Mount Sinai", domain: "mountsinai.org" },
            { name: "NYU Langone", domain: "nyulangone.org" }
          ].map((hospital, i) => (
             <div key={i} className="flex items-center gap-4 mx-8 sm:mx-12">
                <img 
                  src={`https://logo.clearbit.com/${hospital.domain}`} 
                  alt={`${hospital.name} Logo`} 
                  className="h-10 sm:h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to text if the logo fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="hidden font-black text-2xl text-gray-800 whitespace-nowrap">
                  {hospital.name}
                </span>
             </div>
          ))}
        </div>
      </section>

      {/* Feature Grid (Horizontal Scrolling Carousel) */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/40 max-w-[1400px] mx-auto px-6 lg:px-12 relative overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">Explore MedTrack Features</h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">Everything you need to manage the full lifecycle of your medical equipment in one unified platform.</p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div 
            id="features-carousel"
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              {
                img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
                title: "Real-Time Tracking",
                desc: "Monitor equipment health and operational KPIs.",
                btnText: "Track Now",
                bgClass: "bg-gradient-to-br from-orange-100 to-orange-200"
              },
              {
                img: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=600&q=80",
                title: "Automated Maintenance",
                desc: "Predictive scheduling and automated technician dispatches.",
                btnText: "Apply Now",
                bgClass: "bg-gradient-to-br from-fuchsia-100 to-pink-200"
              },
              {
                img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
                title: "Supplier Integration",
                desc: "Process new orders and manage inventory stock seamlessly.",
                btnText: "Avail Now",
                bgClass: "bg-gradient-to-br from-indigo-100 to-blue-200"
              },
              {
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
                title: "HIPAA Compliant",
                desc: "Role-based access control and full audit trails.",
                btnText: "Learn More",
                bgClass: "bg-gradient-to-br from-emerald-100 to-teal-200"
              },
              {
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
                title: "Supplier Portals",
                desc: "Dedicated interfaces for B2B healthcare procurement.",
                btnText: "View Portal",
                bgClass: "bg-gradient-to-br from-amber-100 to-yellow-200"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`snap-start shrink-0 w-[400px] sm:w-[480px] h-[240px] rounded-2xl relative overflow-hidden flex shadow-sm hover:shadow-md transition-shadow ${feature.bgClass}`}
              >
                {/* Background Pattern Overlay (Subtle Waves) */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                
                {/* Left Content */}
                <div className="relative z-10 w-[55%] p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{feature.title}</h3>
                  <p className="text-gray-700 text-sm font-medium mb-6 leading-relaxed">{feature.desc}</p>
                  <div>
                    <button className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors text-sm">
                      {feature.btnText}
                    </button>
                  </div>
                </div>

                {/* Right Image */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%]">
                  <img 
                    src={feature.img} 
                    alt={feature.title} 
                    className="w-full h-full object-cover"
                    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)', maskImage: 'linear-gradient(to right, transparent, black 30%)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right Button Overlay */}
          <div className="absolute right-0 top-0 bottom-8 w-32 bg-gradient-to-l from-surface to-transparent pointer-events-none flex items-center justify-end pr-4">
            <button 
              className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all focus:outline-none border border-gray-100"
              onClick={() => {
                document.getElementById('features-carousel').scrollBy({ left: 400, behavior: 'smooth' });
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition Section (Screenshot Style) */}
      <section className="py-20 bg-white dark:bg-slate-900 max-w-[1400px] mx-auto px-6 lg:px-12 border-t border-subtle">
        <div className="mb-14">
          <h2 className="text-2xl md:text-3xl font-black text-primary mb-2">Why Choose MedTrack</h2>
          <p className="text-base text-secondary font-medium">Take the hassle out of securing your medical equipment for the best years of your facility</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Item 1 */}
          <div>
            <div className="mb-5 relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-md opacity-80 transform -translate-x-2 translate-y-2"></div>
              <svg className="w-9 h-9 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h3 className="font-bold text-primary text-lg mb-2">Instant & Easy Bookings</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">Time is money. Save both when you book with us..</p>
          </div>

          {/* Item 2 */}
          <div>
            <div className="mb-5 relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-md opacity-80 transform -translate-x-2 translate-y-2"></div>
              <svg className="w-9 h-9 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-primary text-lg mb-2">Lowest Price Guarantee</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">Find a lower price and we'll match it. No questions asked.. <a href="#" className="font-bold text-primary underline decoration-subtle underline-offset-4 hover:decoration-primary transition-colors">Learn More</a></p>
          </div>

          {/* Item 3 */}
          <div>
            <div className="mb-5 relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-md opacity-80 transform -translate-x-2 translate-y-2"></div>
              <svg className="w-9 h-9 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-primary text-lg mb-2">24x7 Assistance</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">If you have a doubt or a query, we're always a call away..</p>
          </div>

          {/* Item 4 */}
          <div>
            <div className="mb-5 relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-80 transform -translate-x-2 translate-y-2"></div>
              <svg className="w-9 h-9 text-primary relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-primary text-lg mb-2">100% Verified Listings</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">We promise to deliver what you see on the website..</p>
          </div>
        </div>
      </section>

      {/* Get Ahead with MedTrack (Glassdoor style) */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/40 max-w-[1400px] mx-auto px-6 lg:px-12 text-center border-t border-subtle">
        <h2 className="text-2xl md:text-3xl font-black text-primary mb-3 tracking-tight">Get ahead with MedTrack</h2>
        <p className="text-secondary font-medium max-w-2xl mx-auto mb-10 text-sm">
          We're serving up trusted insights and seamless procurement, so you'll have the equipment you need to succeed.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {/* Item 1 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full border-[1.5px] border-primary flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-primary font-medium text-xs sm:text-sm">Join your medical network</p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full border-[1.5px] border-primary flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <p className="text-primary font-medium text-xs sm:text-sm">Find and request equipment</p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full border-[1.5px] border-primary flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-primary font-medium text-xs sm:text-sm">Search supplier reviews</p>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-[64px] h-[64px] rounded-full border-[1.5px] border-primary flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-primary font-medium text-xs sm:text-sm">Compare supplier prices</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section (Upgraded Style) */}
      <section className="py-12 bg-white dark:bg-slate-900 max-w-[1400px] mx-auto px-6 lg:px-12 border-t border-subtle">
        <h2 className="text-xl md:text-2xl font-black text-primary mb-1">Need help? Let's connect</h2>
        <p className="text-sm text-secondary font-medium mb-8">If you have any queries or want to collaborate, feel free to reach out.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Partner With Us */}
          <div className="relative rounded-2xl bg-[#D6E8FC] dark:bg-blue-900/20 overflow-hidden flex min-h-[220px]">
            {/* Left Content */}
            <div className="relative z-10 w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Partner With Us</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                At MedTrack, we offer a seamless onboarding process and robust supplier support.
              </p>
              <div>
                <button className="bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded shadow-sm hover:shadow transition-all">
                  Partner With Us
                </button>
              </div>
            </div>
            {/* Right Image Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D6E8FC] dark:from-[#131f36] to-transparent z-10 w-1/3"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173ff9e5eb3?auto=format&fit=crop&w=600&q=80" 
                alt="Partner Handshake" 
                className="w-full h-full object-cover object-left mix-blend-multiply dark:mix-blend-screen opacity-90"
              />
            </div>
          </div>

          {/* Card 2: List With Us */}
          <div className="relative rounded-2xl bg-[#D6E8FC] dark:bg-blue-900/20 overflow-hidden flex min-h-[220px]">
            {/* Left Content */}
            <div className="relative z-10 w-3/5 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">List Equipment</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                List your medical properties and equipment efficiently with MedTrack.
              </p>
              <div>
                <button className="bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded shadow-sm hover:shadow transition-all">
                  List Equipment
                </button>
              </div>
            </div>
            {/* Right Image Mask */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D6E8FC] dark:from-[#131f36] to-transparent z-10 w-1/3"></div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80" 
                alt="List Equipment" 
                className="w-full h-full object-cover object-left mix-blend-multiply dark:mix-blend-screen opacity-90"
              />
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
}
