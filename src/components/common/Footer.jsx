import { useState } from "react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/40 text-secondary mt-auto border-t border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-8">
        
        {/* Top Section: Logo & Links */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16">
          
          {/* Logo (Left) */}
          <div className="lg:w-1/4">
            <a href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tighter text-blue-600">
                "medtrack"
              </span>
            </a>
          </div>

          {/* Links Grid (Right) */}
          <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: MedTrack */}
            <div>
              <h4 className="text-primary font-bold text-[15px] mb-5">MedTrack</h4>
              <ul className="space-y-4 text-[14px] font-medium text-secondary flex flex-col items-start">
                <li><button onClick={() => onNavigate && onNavigate("about")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">About / Press</button></li>
                <li><button onClick={() => onNavigate && onNavigate("awards")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Awards</button></li>
                <li><button onClick={() => onNavigate && onNavigate("blog")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Blog</button></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Research</a></li>
                <li><button onClick={() => onNavigate && onNavigate("contact")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Contact Us</button></li>
                <li><button onClick={() => onNavigate && onNavigate("guides")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Guides</button></li>
              </ul>
            </div>

            {/* Column 2: Suppliers */}
            <div>
              <h4 className="text-primary font-bold text-[15px] mb-5">Suppliers</h4>
              <ul className="space-y-4 text-[14px] font-medium text-secondary flex flex-col items-start">
                <li><button onClick={() => onNavigate && onNavigate("register", "Supplier")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Free Supplier Account</button></li>
                <li><button onClick={() => onNavigate && onNavigate("supplier-centre")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Supplier Centre</button></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Suppliers Blog</a></li>
              </ul>
            </div>

            {/* Column 3: Information */}
            <div>
              <h4 className="text-primary font-bold text-[15px] mb-5">Information</h4>
              <ul className="space-y-4 text-[14px] font-medium text-secondary flex flex-col items-start">
                <li><button onClick={() => onNavigate && onNavigate("help")} className="hover:text-primary transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Help</button></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Guidelines</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Terms of Use</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Privacy and Ad Choices</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Do Not Sell Or Share My Information</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Cookie Consent Tool</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Column 4: Work With Us */}
            <div>
              <h4 className="text-primary font-bold text-[15px] mb-5">Work With Us</h4>
              <ul className="space-y-4 text-[14px] font-medium text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Advertisers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Middle Section: Apps, Socials, Country */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-t border-subtle">
          
          {/* Download App & Socials */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-secondary mr-2">Download the App</span>
              <a href="#" className="text-primary hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 9.48l1.84-3.18c.16-.27.06-.61-.21-.76-.27-.16-.62-.06-.77.21l-1.89 3.27C15.22 8.44 13.66 8 12 8c-1.66 0-3.22.44-4.57 1.02L5.54 5.75c-.15-.27-.5-.37-.77-.21-.27.15-.37.49-.21.76l1.84 3.18C4.1 10.97 2.45 13.56 2 16.5h20c-.45-2.94-2.1-5.53-4.4-7.02zM7 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
              </a>
              <a href="#" className="text-primary hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.19.07 2.15.53 2.82 1.39-2.31 1.4-1.92 4.45.54 5.38-.63 1.57-1.39 3.12-1.94 6.2zm-3.8-15.63c.69-.87 1.14-2.08.97-3.27-1.14.07-2.37.7-3.07 1.57-.6.76-1.14 1.99-.95 3.16 1.25.13 2.36-.6 3.05-1.46z"/></svg>
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              {/* FB */}
              <a href="#" className="w-8 h-8 rounded-full border-[1.5px] border-secondary flex items-center justify-center text-primary hover:border-primary transition-colors">
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-8 h-8 rounded-full border-[1.5px] border-secondary flex items-center justify-center text-primary hover:border-primary transition-colors">
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* Youtube */}
              <a href="#" className="w-8 h-8 rounded-full border-[1.5px] border-secondary flex items-center justify-center text-primary hover:border-primary transition-colors">
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full border-[1.5px] border-secondary flex items-center justify-center text-primary hover:border-primary transition-colors">
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-8 h-8 rounded-full border-[1.5px] border-secondary flex items-center justify-center text-primary hover:border-primary transition-colors">
                <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Region Dropdown */}
          <div className="relative w-full md:w-auto mt-4 md:mt-0">
            <select className="w-full md:w-auto bg-transparent border border-subtle text-primary text-sm rounded-lg pl-4 pr-10 py-2 outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
              <option value="uk">United Kingdom</option>
              <option value="us">United States</option>
              <option value="in">India</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-6 border-t border-subtle text-center text-[12.5px] text-secondary space-y-2 font-medium">
          <p>Browse by: Equipment, Categories, Brands, Specialities, Recent posts</p>
          <p>Copyright © 2008-2026. MedTrack, Inc. "MedTrack", "MedTrack Pro" and logo are proprietary trademarks of MedTrack, Inc.</p>
        </div>

      </div>
    </footer>
  );
}
