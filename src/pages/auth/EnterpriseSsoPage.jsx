import EnterpriseSsoPanel from "../../components/auth/EnterpriseSsoPanel";
import { ArrowLeft, ShieldCheck, Globe, KeyRound, Server, Activity } from "lucide-react";
import "./auth.css";

export default function EnterpriseSsoPage({ onNavigate }) {
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
              S
            </div>
            <span className="font-bold text-lg text-white">MedTrack SSO Security Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck size={14} /> Enterprise OAuth2 & SAML 2.0
          </span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-8 border border-slate-700/50 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              Federated Single Sign-On Governance
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Identity Provider & Security Risk Hub
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Enable seamless authentication for corporate medical staff and hospital partners using Okta, Microsoft Entra ID (Azure AD), Google Workspace, or custom SAML 2.0 endpoints mapped by email domain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Globe size={20} className="text-indigo-400" />
                <div>
                  <div className="text-xs text-slate-400">Domain Resolution</div>
                  <div className="text-xs font-semibold text-white">Automatic SSO Discovery</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <KeyRound size={20} className="text-sky-400" />
                <div>
                  <div className="text-xs text-slate-400">Federated Protocols</div>
                  <div className="text-xs font-semibold text-white">OAuth2, OIDC & SAML 2.0</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <Activity size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-400">Threat Risk Engine</div>
                  <div className="text-xs font-semibold text-white">Real-Time Risk Scoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Component */}
        <section>
          <EnterpriseSsoPanel />
        </section>
      </main>
    </div>
  );
}
