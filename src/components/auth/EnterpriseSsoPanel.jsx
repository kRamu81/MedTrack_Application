import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  KeyRound,
  ShieldAlert,
  Server,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Activity,
  Layers,
  Lock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllSsoProviders,
  configureSsoProvider,
  initiateSsoLogin,
  toggleSsoProvider,
  evaluateUserSecurityRisk,
  getUserAuditLogs
} from "../../services/SsoSecurityService";
import "../../pages/auth/auth.css";

export default function EnterpriseSsoPanel() {
  const { user } = useAuth();

  const [providers, setProviders] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form fields
  const [providerName, setProviderName] = useState("Google Workspace");
  const [domainKey, setDomainKey] = useState("medtrack.org");
  const [providerType, setProviderType] = useState("OAUTH2");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [authorizationUrl, setAuthorizationUrl] = useState("");

  // SSO Test lookup
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadSsoData = useCallback(async () => {
    setLoading(true);
    try {
      const [provList, riskRes, logsRes] = await Promise.all([
        getAllSsoProviders().catch(() => []),
        user?.id ? evaluateUserSecurityRisk(user.id).catch(() => null) : Promise.resolve(null),
        user?.id ? getUserAuditLogs(user.id).catch(() => []) : Promise.resolve([])
      ]);

      setProviders(provList);
      if (riskRes) setRiskAnalysis(riskRes);
      if (logsRes) setAuditLogs(logsRes);
    } catch (err) {
      console.error("Failed to load SSO & Risk data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSsoData();
  }, [loadSsoData]);

  const handleConfigureProvider = async (e) => {
    e.preventDefault();
    if (!domainKey || !clientId || !clientSecret) {
      setMessage({ type: "error", text: "Domain key, Client ID, and Client Secret are required." });
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await configureSsoProvider({
        providerName,
        domainKey: domainKey.toLowerCase().trim(),
        providerType,
        clientId,
        clientSecret,
        authorizationUrl,
        enabled: true
      });

      setMessage({ type: "success", text: `Identity Provider for ${domainKey} configured successfully!` });
      setShowConfigModal(false);
      setClientId("");
      setClientSecret("");
      await loadSsoData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to configure Identity Provider." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestSsoDiscovery = async (e) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid corporate email address." });
      return;
    }

    setActionLoading(true);
    try {
      const res = await initiateSsoLogin(testEmail.trim());
      setTestResult(res);
    } catch (err) {
      setMessage({ type: "error", text: "SSO discovery lookup failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleState = async (providerId, currentStatus) => {
    setActionLoading(true);
    try {
      await toggleSsoProvider(providerId, !currentStatus);
      await loadSsoData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update provider status." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-indigo-500/20 text-indigo-400">
            <Globe size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Enterprise SSO & Identity Federation</h2>
              <span className="authority-ver-badge bg-indigo-500/20 text-indigo-300">
                SAML 2.0 / OAUTH2
              </span>
            </div>
            <p className="authority-subtitle">
              Connect Google Workspace, Microsoft Entra ID / Azure AD, Okta, and Custom IdPs by Domain Key
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => setShowConfigModal(true)}
          >
            <PlusCircle size={16} /> Connect Identity Provider
          </button>
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadSsoData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync State
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="authority-content-grid">
        {/* Card 1: Active Identity Providers */}
        <div className="authority-card">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-indigo-400" />
              <h3>Configured Identity Providers ({providers.length})</h3>
            </div>
          </div>

          <div className="card-body">
            {providers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Globe size={24} className="mx-auto mb-2 opacity-50 text-indigo-400" />
                No enterprise identity providers configured yet. Click "Connect Identity Provider" to onboard Okta or Azure AD.
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {p.providerName?.charAt(0) || "I"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {p.providerName}
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full uppercase">
                            {p.providerType}
                          </span>
                        </div>
                        <div className="text-xs text-indigo-300 font-mono">
                          Domain: @{p.domainKey} &bull; Client ID: {p.clientId ? p.clientId.substring(0, 8) + "..." : "Configured"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-slate-400 hover:text-white p-2"
                      onClick={() => handleToggleState(p.id, p.enabled)}
                      disabled={actionLoading}
                      title={p.enabled ? "Disable Provider" : "Enable Provider"}
                    >
                      {p.enabled ? <ToggleRight size={26} className="text-emerald-400" /> : <ToggleLeft size={26} className="text-slate-500" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Test Domain SSO Discovery */}
        <div className="authority-card">
          <div className="card-header">
            <Search size={18} className="text-sky-400" />
            <h3>Test Corporate Domain SSO Discovery</h3>
          </div>

          <div className="card-body space-y-4">
            <p className="text-xs text-slate-300">
              Enter a employee or doctor email address to test domain resolution and SSO redirect route generation.
            </p>

            <form onSubmit={handleTestSsoDiscovery} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g. doctor@stjude.org"
                  className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                />
                <button type="submit" className="authority-btn authority-btn-secondary text-xs" disabled={actionLoading}>
                  Discover SSO
                </button>
              </div>
            </form>

            {testResult && (
              <div className={`p-4 rounded-xl text-xs space-y-2 border ${testResult.ssoAvailable ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : "bg-amber-950/40 border-amber-500/30 text-amber-300"}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>Domain: @{testResult.domainKey}</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 text-white">
                    {testResult.ssoAvailable ? "SSO ACTIVE" : "LOCAL LOGIN"}
                  </span>
                </div>

                <p>{testResult.message}</p>

                {testResult.redirectUrl && (
                  <div className="pt-2">
                    <a
                      href={testResult.redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 underline hover:text-sky-200"
                    >
                      <ExternalLink size={12} /> Test Redirect URL
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Risk Score Summary */}
            {riskAnalysis && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <ShieldAlert size={14} className="text-amber-400" /> Account Risk Level:
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${riskAnalysis.riskLevel === "LOW" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {riskAnalysis.riskLevel} ({riskAnalysis.threatRiskScore}/100)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Configure Provider */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound size={18} className="text-indigo-400" /> Connect Enterprise Identity Provider
              </h3>
              <button type="button" className="text-slate-400 hover:text-white text-xs" onClick={() => setShowConfigModal(false)}>
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleConfigureProvider} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Type & Title:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                >
                  <option value="Google Workspace">Google Workspace (OAuth2 / OIDC)</option>
                  <option value="Microsoft Entra ID">Microsoft Entra ID / Azure AD</option>
                  <option value="Okta Enterprise">Okta Workforce Identity</option>
                  <option value="Custom SAML 2.0">Custom SAML 2.0 Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email Domain Key:</label>
                <input
                  type="text"
                  placeholder="e.g. stjude.org or hospital.org"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={domainKey}
                  onChange={(e) => setDomainKey(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">OAuth Client ID / SAML Entity:</label>
                  <input
                    type="text"
                    placeholder="Client ID"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Secret Key:</label>
                  <input
                    type="password"
                    placeholder="Secret Key"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Authorization Endpoint URL (Optional):</label>
                <input
                  type="text"
                  placeholder="https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={authorizationUrl}
                  onChange={(e) => setAuthorizationUrl(e.target.value)}
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  className="authority-btn authority-btn-secondary text-xs"
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="authority-btn authority-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  disabled={actionLoading}
                >
                  Save & Enable Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
