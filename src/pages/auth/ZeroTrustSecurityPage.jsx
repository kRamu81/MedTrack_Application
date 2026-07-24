import ZeroTrustSecurityPanel from "../../components/auth/ZeroTrustSecurityPanel";
import { ArrowLeft, ShieldAlert, Globe, Sliders, Zap } from "lucide-react";
import "./auth.css";

export default function ZeroTrustSecurityPage({ onNavigate }) {
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
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-md">
              Z
            </div>
            <span className="font-bold text-lg text-white">MedTrack Zero-Trust Threat Protection</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert size={14} /> Zero-Trust Anomaly Engine
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-rose-950 to-slate-900 p-8 border border-slate-700/50 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20">
              Active IP Threat Intelligence
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Zero-Trust Security Guard & Anomaly Rate Limiting Hub
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Monitor IP threat reputation scores, configure rate limiting thresholds, enforce geo-fencing rules, and evaluate real-time anomaly detection logs to secure enterprise medical telemetry endpoints.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Globe size={20} className="text-rose-400" />
                <div>
                  <div className="text-xs text-slate-400">Geo & IP Threat</div>
                  <div className="text-xs font-semibold text-white">Reputation Scoring</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Sliders size={20} className="text-amber-400" />
                <div>
                  <div className="text-xs text-slate-400">Rate Limiting</div>
                  <div className="text-xs font-semibold text-white">Automated IP Blocking</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Zap size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-400">Anomaly Engine</div>
                  <div className="text-xs font-semibold text-white">Real-Time Threat Sandbox</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Component */}
        <section>
          <ZeroTrustSecurityPanel />
        </section>
      </main>
    </div>
  );
}
