import EnterpriseSecurityCenter from "../../components/auth/EnterpriseSecurityCenter";
import { ArrowLeft, ShieldCheck, Lock, Award, Server } from "lucide-react";
import "./auth.css";

export default function AuthoritySecurityPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            onClick={() => onNavigate && onNavigate("dashboard")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center font-black text-white shadow-md">
              M
            </div>
            <span className="font-bold text-lg text-white">MedTrack Enterprise Security</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={14} /> HIPAA & SOC2 Compliant
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        <EnterpriseSecurityCenter />
      </main>
    </div>
  );
}

