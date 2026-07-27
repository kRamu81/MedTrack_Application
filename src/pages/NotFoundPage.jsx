import React from "react";

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white p-6">
      <div className="bg-slate-800 rounded-[2rem] p-16 text-center border border-slate-700/50 max-w-md shadow-2xl">
        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 text-4xl">
          ?
        </div>
        <h1 className="text-6xl font-black mb-2">404</h1>
        <h2 className="text-2xl font-black mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => onNavigate("landing")}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
