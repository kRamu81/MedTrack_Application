import React, { useState } from "react";
import AnimatedSection from "../components/common/AnimatedSection";
import { jobs } from "../data/jobs";

export default function CareersPage({ onNavigate }) {
  // State for job filters
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredJobs = jobs.filter(job => {
    const matchDept = departmentFilter === "All" || job.department === departmentFilter;
    const matchLoc = locationFilter === "All" || job.location.includes(locationFilter) || job.location === "Remote (Global)";
    const matchType = typeFilter === "All" || job.type === typeFilter;
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchLoc && matchType && matchSearch;
  });

  const faqs = [
    { q: "How do I apply?", a: "Simply click 'Apply' on any open role. You'll be asked to submit your resume and optionally a cover letter or portfolio." },
    { q: "Can I work remotely?", a: "Yes! MedTrack is a remote-first globally distributed company. Many of our roles can be done from anywhere." },
    { q: "Do you offer internship opportunities?", a: "We run a summer internship program for engineering and design students. Keep an eye on this page in early Spring." },
    { q: "What is the interview duration?", a: "Our process typically takes 2-3 weeks from the initial recruiter call to the final offer." },
    { q: "What is the application timeline?", a: "We aim to review all applications within 48 hours and will notify you of the next steps." },
  ];

  return (
    <div className="bg-surface text-primary font-sans min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <AnimatedSection className="relative z-10 max-w-4xl px-6">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase mb-6 inline-block border border-blue-100">
            Join Our Team
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Build the future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">health infrastructure</span>
          </h1>
          <p className="text-xl text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            We're a globally-distributed team on a mission to democratize health record access and streamline hospital operations worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
            >
              View Open Positions
            </button>
            <button 
              onClick={() => document.getElementById('culture').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-primary border border-subtle hover:border-strong rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Learn About Our Culture
            </button>
          </div>
        </AnimatedSection>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-secondary hidden md:block">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* 2. ABOUT WORKING AT MEDTRACK */}
      <section id="culture" className="py-24 bg-card border-y border-subtle">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="animate-fade-right">
            <h2 className="text-4xl font-bold mb-6">Doing work that matters</h2>
            <p className="text-lg text-secondary mb-6 leading-relaxed">
              At MedTrack, every line of code you write, every design you create, and every customer you help directly impacts the quality of healthcare delivery.
            </p>
            <ul className="space-y-4">
              {[
                "Deploying critical infrastructure to hospitals.",
                "Reducing equipment downtime to save lives.",
                "Ensuring patient data security and privacy.",
                "Building tools for world-class medical professionals."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection animation="animate-fade-left" className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-3xl translate-x-4 translate-y-4 opacity-20"></div>
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" alt="Medical professionals using technology" className="relative rounded-3xl z-10 w-full h-[500px] object-cover shadow-2xl" />
          </AnimatedSection>
        </div>
      </section>

      {/* 3. COMPANY VALUES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-lg text-secondary">The principles that guide our decisions, our product, and how we treat each other.</p>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Empathy First", desc: "We build for patients and doctors. Their needs and well-being come before everything else.", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
            { title: "Ownership", desc: "We are all stakeholders. We take initiative, own our outcomes, and hold each other accountable.", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
            { title: "Continuous Learning", desc: "Healthcare and technology evolve rapidly. We remain curious and adapt to new challenges.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }
          ].map((val, i) => (
            <AnimatedSection key={i} animation="animate-fade-up" delay={`delay-${i * 100}`}>
              <div className="p-8 rounded-3xl bg-surface border border-subtle hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/5 transition-all group h-full">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={val.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-secondary leading-relaxed">{val.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 4. BENEFITS & PERKS */}
      <section className="py-24 bg-card border-y border-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Benefits & Perks</h2>
            <p className="text-lg text-secondary">We take care of our team so they can focus on taking care of others.</p>
          </AnimatedSection>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Health Insurance", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
              { title: "Remote Work", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
              { title: "Flexible Hours", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Learning Budget", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "Team Retreats", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { title: "Mental Wellness", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Paid Leave", icon: "M5 13l4 4L19 7" },
              { title: "Home Office", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            ].map((perk, i) => (
              <AnimatedSection key={i} animation="animate-scale-up" delay={`delay-${(i%4) * 100}`}>
                <div className="bg-surface p-6 rounded-2xl border border-subtle flex items-center gap-4 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-primary flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={perk.icon} /></svg>
                  </div>
                  <span className="font-bold">{perk.title}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OPEN POSITIONS */}
      <section id="open-positions" className="py-24 max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Open Positions</h2>
          <p className="text-lg text-secondary">Join us in transforming healthcare infrastructure.</p>
        </AnimatedSection>

        {/* Filters */}
        <AnimatedSection className="bg-card p-4 rounded-2xl border border-subtle mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          
          <div className="relative w-full md:w-1/3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-subtle rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0">
            <select 
              className="bg-transparent border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Data">Data</option>
              <option value="Product">Product</option>
              <option value="Customer Success">Customer Success</option>
            </select>

            <select 
              className="bg-transparent border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Accra">Accra</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
            </select>
          </div>
        </AnimatedSection>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, i) => (
              <AnimatedSection key={job.id} animation="animate-fade-up">
                <div className="group bg-surface p-6 sm:p-8 rounded-3xl border border-subtle hover:border-blue-500/30 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        {job.department}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-bold uppercase tracking-wider text-blue-600">
                        {job.type}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-secondary mb-4 max-w-2xl">{job.desc}</p>
                    
                    <div className="flex items-center gap-4 text-sm font-medium text-secondary">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {job.exp}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:w-48 shrink-0">
                    <button 
                      onClick={() => onNavigate("apply", job.id)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors w-full"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => onNavigate("apply", job.id)}
                      className="px-6 py-3 bg-white dark:bg-slate-800 text-primary border border-subtle hover:border-strong rounded-xl font-bold transition-all w-full"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))
          ) : (
            <div className="text-center py-24 bg-card rounded-3xl border border-subtle">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No positions found</h3>
              <p className="text-secondary">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. HIRING PROCESS */}
      <section className="py-24 bg-card border-y border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Our Hiring Process</h2>
            <p className="text-lg text-secondary">What to expect when you apply.</p>
          </AnimatedSection>

          <div className="relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 rounded"></div>
            
            <div className="grid md:grid-cols-5 gap-8 relative z-10">
              {[
                { title: "Application", desc: "Submit your resume" },
                { title: "Review", desc: "Recruiter screen" },
                { title: "Technical", desc: "Take-home or pairing" },
                { title: "Team", desc: "Meet your future peers" },
                { title: "Offer", desc: "Welcome to MedTrack!" },
              ].map((step, i) => (
                <AnimatedSection key={i} animation="animate-fade-up" delay={`delay-${i * 100}`}>
                  <div className="flex flex-row md:flex-col items-center gap-6 md:gap-4 md:text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg ring-4 ring-card shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{step.title}</h4>
                      <p className="text-sm text-secondary">{step.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMPLOYEE EXPERIENCE */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <AnimatedSection className="mb-16">
          <h2 className="text-4xl font-bold mb-4">Engineering Culture</h2>
          <p className="text-lg text-secondary max-w-2xl">We believe in empowering teams with the right tools and autonomy to solve hard problems.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          <AnimatedSection animation="animate-fade-right">
            <div className="h-full bg-surface rounded-3xl p-8 md:p-12 border border-subtle overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">Open Source & Hackathons</h3>
                <p className="text-secondary text-lg leading-relaxed mb-6">
                  We host bi-annual hackathons where employees can build anything they want. We also actively encourage contributions to open-source healthcare projects.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-64 h-64 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="animate-fade-left">
            <div className="h-full bg-surface rounded-3xl p-8 md:p-12 border border-subtle overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-3xl font-bold mb-4">Innovation Days</h3>
                <p className="text-secondary text-lg leading-relaxed mb-6">
                  Every last Friday of the month is dedicated to learning. Read a book, try a new framework, or build a proof-of-concept without sprint pressure.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 8. FAQs */}
      <section className="py-24 bg-card border-y border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} animation="animate-fade-up">
                <div className="bg-surface rounded-2xl border border-subtle overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
                  >
                    <p className="px-6 pb-5 text-secondary">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <AnimatedSection className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Ready to make an impact?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join MedTrack today and help us build the next generation of healthcare infrastructure for millions of patients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('open-positions').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-700 hover:bg-gray-50 rounded-xl font-bold transition-all shadow-xl hover:-translate-y-0.5"
            >
              See Open Roles
            </button>
            <button className="px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-xl font-bold transition-all">
              Join Talent Network
            </button>
          </div>
        </AnimatedSection>
      </section>

    </div>
  );
}
