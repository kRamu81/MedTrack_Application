import AuthoritySecurityPanel from "../../components/auth/AuthoritySecurityPanel";
import { ArrowLeft, ShieldCheck, Lock, Award, Server } from "lucide-react";
import "./auth.css";

export default function AuthoritySecurityPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            onClick={() => onNavigate && onNavigate("dashboard")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-md">
              M
            </div>
            <span className="font-bold text-lg text-white">MedTrack Security</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={14} /> HIPAA Compliant
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-sky-950 to-slate-900 p-8 border border-slate-700/50 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20">
              Identity & Authority Management
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Cryptographic Authority Versioning & Session Control
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Manage real-time user authority versions, verify fine-grained role privileges, and instantly revoke active JWT sessions across devices when role changes or security events occur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Lock size={20} className="text-sky-400" />
                <div>
                  <div className="text-xs text-slate-400">Token Validation</div>
                  <div className="text-xs font-semibold text-white">Claims Versioning</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Award size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-400">Security Model</div>
                  <div className="text-xs font-semibold text-white">PBAC & RBAC</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Server size={20} className="text-purple-400" />
                <div>
                  <div className="text-xs text-slate-400">Audit Logging</div>
                  <div className="text-xs font-semibold text-white">Persistent Trail</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authority Panel Component */}
        <section>
          <AuthoritySecurityPanel />
        </section>
      </main>
    </div>
  );
}
