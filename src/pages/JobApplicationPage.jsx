import React, { useState, useEffect } from "react";
import AnimatedSection from "../components/common/AnimatedSection";
import { jobs } from "../data/jobs";

export default function JobApplicationPage({ onNavigate, jobId }) {
  const [job, setJob] = useState(null);
  
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Drag & Drop States
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    // Simulate fetching job from backend
    const foundJob = jobs.find(j => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      window.scrollTo(0, 0);
    } else {
      // If job not found, redirect to careers page
      onNavigate("careers");
    }
  }, [jobId, onNavigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Optional: Redirect back after success
      // setTimeout(() => onNavigate("careers"), 3000);
    }, 1500);
  };

  if (!job) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-surface text-primary font-sans min-h-screen pt-20 pb-24">
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
        
        {/* Back Button */}
        <button 
          onClick={() => onNavigate("careers")}
          className="flex items-center gap-2 text-secondary hover:text-blue-600 font-bold mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Careers
        </button>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* LEFT: JOB DETAILS */}
          <div className="w-full lg:w-1/2">
            <AnimatedSection animation="animate-fade-right">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs font-bold uppercase tracking-wider text-blue-600">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  {job.type}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-secondary mb-10 pb-10 border-b border-subtle font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {job.exp}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-secondary text-lg">
                <h3 className="text-2xl font-bold text-primary mb-4">About the Role</h3>
                <p className="mb-8">{job.desc}</p>
                
                <h3 className="text-2xl font-bold text-primary mb-4">What You'll Do</h3>
                <ul className="mb-8 space-y-3">
                  {job.responsibilities?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="text-2xl font-bold text-primary mb-4">What We're Looking For</h3>
                <ul className="space-y-3">
                  {job.requirements?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>

          {/* RIGHT: APPLICATION FORM (STICKY) */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32 relative">
            
            {/* Form Background Pattern */}
            <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] -z-10 -m-4"></div>

            <AnimatedSection animation="animate-fade-left">
              <div className="bg-card border border-subtle rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-blue-900/5">
                
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
                    <p className="text-secondary text-lg mb-8">
                      Thank you for applying to the <span className="font-bold text-primary">{job.title}</span> role. We've received your application and will be in touch shortly.
                    </p>
                    <button 
                      onClick={() => onNavigate("careers")}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all w-full shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
                    >
                      Return to Careers
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Submit your application</h2>
                    <p className="text-secondary mb-8">Fields marked with an asterisk (*) are required.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Personal Info Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-primary">First Name *</label>
                          <input required type="text" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-primary">Last Name *</label>
                          <input required type="text" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Email Address *</label>
                        <input required type="email" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all" />
                      </div>

                      {/* Links Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-primary flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            LinkedIn Profile
                          </label>
                          <input type="url" placeholder="https://" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-primary flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            GitHub / Portfolio
                          </label>
                          <input type="url" placeholder="https://" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all" />
                        </div>
                      </div>

                      {/* Resume Upload (Drag & Drop) */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Resume / CV *</label>
                        <div 
                          className={`relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer
                            ${dragActive ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-subtle bg-surface hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input 
                            required 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                          />
                          {fileName ? (
                            <div className="flex items-center gap-2 text-blue-600 font-bold">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {fileName}
                            </div>
                          ) : (
                            <div className="text-center">
                              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                              <p className="text-sm text-secondary font-medium"><span className="text-blue-600 font-bold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Cover Letter / Note</label>
                        <textarea rows="4" className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all resize-none"></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}
