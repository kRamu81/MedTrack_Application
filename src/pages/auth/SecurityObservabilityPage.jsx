import SecurityObservabilityPanel from "../../components/auth/SecurityObservabilityPanel";
import { ArrowLeft, Radio, Cpu, Zap, Server } from "lucide-react";
import "./auth.css";

export default function SecurityObservabilityPage({ onNavigate }) {
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
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              O
            </div>
            <span className="font-bold text-lg text-white">MedTrack Security Observability</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio size={14} /> OpenTelemetry Stream Active
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-indigo-955 to-slate-900 p-8 border border-slate-700/50 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              Real-Time Security Observability
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Security Observability & OpenTelemetry Telemetry Stream Subsystem
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Stream distributed security logs, trace authentication contexts across microservices via OpenTelemetry standards, and monitor high-throughput security metric gauges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Radio size={20} className="text-indigo-400" />
                <div>
                  <div className="text-xs text-slate-400">OpenTelemetry</div>
                  <div className="text-xs font-semibold text-white">W3C Context Tracing</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Cpu size={20} className="text-amber-400" />
                <div>
                  <div className="text-xs text-slate-400">Metric Gauges</div>
                  <div className="text-xs font-semibold text-white">Latency & Throughput</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Zap size={20} className="text-cyan-400" />
                <div>
                  <div className="text-xs text-slate-400">Anomaly Streams</div>
                  <div className="text-xs font-semibold text-white">Real-Time Ingestion</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Component */}
        <section>
          <SecurityObservabilityPanel />
        </section>
      </main>
    </div>
  );
}
