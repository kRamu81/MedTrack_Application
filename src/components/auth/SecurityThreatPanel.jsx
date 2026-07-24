import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Flame,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  UserX,
  PlusCircle,
  Activity,
  History,
  Sliders
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  reportIncident,
  executeContainment,
  resolveIncident,
  getAllIncidents,
  getAllContainmentActions
} from "../../services/SecurityThreatService";
import "../../pages/auth/auth.css";

export default function SecurityThreatPanel() {
  const [policy, setPolicy] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [containmentActions, setContainmentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [maxFailedLogins, setMaxFailedLogins] = useState(5);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [autoContainmentEnabled, setAutoContainmentEnabled] = useState(true);
  const [notifySoc, setNotifySoc] = useState(true);

  // New Incident Form State
  const [newThreatType, setNewThreatType] = useState("BRUTE_FORCE_BURST");
  const [newThreatLevel, setNewThreatLevel] = useState("HIGH");
  const [newRiskScore, setNewRiskScore] = useState(85);
  const [newIp, setNewIp] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newDetails, setNewDetails] = useState("");

  const loadThreatData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, incList, actList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllIncidents().catch(() => []),
        getAllContainmentActions().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setMaxFailedLogins(pol.maxFailedLoginsPerMinute || 5);
        setRiskThreshold(pol.anomalyRiskThreshold || 75);
        setAutoContainmentEnabled(pol.autoContainmentEnabled);
        setNotifySoc(pol.notifySecurityOperationsCenter);
      }

      setIncidents(incList);
      setContainmentActions(actList);
    } catch (err) {
      console.error("Failed to load threat SOAR data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreatData();
  }, [loadThreatData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_THREAT_POLICY",
        maxFailedLoginsPerMinute: Number(maxFailedLogins),
        anomalyRiskThreshold: Number(riskThreshold),
        autoContainmentEnabled,
        notifySecurityOperationsCenter: notifySoc
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Threat SOAR policy parameters saved successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const reported = await reportIncident({
        threatType: newThreatType,
        threatLevel: newThreatLevel,
        riskScore: Number(newRiskScore),
        sourceIp: newIp.trim() || "192.168.1.100",
        targetUsername: newUser.trim() || "admin@medtrack.org",
        incidentDetails: newDetails.trim() || "Simulated threat anomaly"
      });

      setNewIp("");
      setNewUser("");
      setNewDetails("");
      setMessage({ type: "success", text: `Incident ingested: ${reported.incidentId}` });
      await loadThreatData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to report incident." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleContainmentAction = async (incidentId, actionType) => {
    setActionLoading(true);
    try {
      await executeContainment({
        incidentId,
        actionType,
        actionNotes: `Manual SOAR containment: ${actionType} triggered by operator`
      });

      setMessage({ type: "success", text: `Executed ${actionType} containment for ${incidentId}!` });
      await loadThreatData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to execute containment action." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveIncident = async (incidentId) => {
    setActionLoading(true);
    try {
      await resolveIncident(incidentId);
      setMessage({ type: "success", text: `Incident ${incidentId} marked as RESOLVED.` });
      await loadThreatData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to resolve incident." });
    } finally {
      setActionLoading(false);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status === "DETECTED" || i.status === "INVESTIGATING");
  const criticalIncidents = incidents.filter((i) => i.threatLevel === "CRITICAL" && i.status !== "RESOLVED");

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-rose-500/20 text-rose-400">
            <Flame size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Threat Intelligence & SOAR Incident Response</h2>
              <span className="authority-ver-badge bg-rose-500/20 text-rose-300">
                ACTIVE THREATS: {activeIncidents.length} ({criticalIncidents.length} CRITICAL)
              </span>
            </div>
            <p className="authority-subtitle">
              Automated anomaly risk scoring, real-time SOC incident ingestion, and instant SOAR containment workflows
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadThreatData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Stream
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ingestion Simulator & Policy Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Threat Simulator Form */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-rose-400" />
                <h3>Ingest Threat Incident</h3>
              </div>
            </div>

            <form onSubmit={handleReportIncident} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Threat Type:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={newThreatType}
                  onChange={(e) => setNewThreatType(e.target.value)}
                >
                  <option value="BRUTE_FORCE_BURST">BRUTE_FORCE_BURST</option>
                  <option value="ANOMALOUS_GEOLOCATION">ANOMALOUS_GEOLOCATION</option>
                  <option value="PRIVILEGE_ESCALATION">PRIVILEGE_ESCALATION</option>
                  <option value="DATA_EXFILTRATION">DATA_EXFILTRATION</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    value={newThreatLevel}
                    onChange={(e) => setNewThreatLevel(e.target.value)}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Score (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    value={newRiskScore}
                    onChange={(e) => setNewRiskScore(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source IP Address:</label>
                <input
                  type="text"
                  placeholder="e.g. 198.51.100.42"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Account:</label>
                <input
                  type="text"
                  placeholder="e.g. admin@medtrack.org"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-rose-600 hover:bg-rose-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Ingest Security Incident
              </button>
            </form>
          </div>

          {/* SOAR Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-rose-400" />
                <h3>SOAR Policy Rules</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Anomaly Trigger Score (0-100):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(e.target.value)}
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Automated SOAR Containment</span>
                  <input
                    type="checkbox"
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                    checked={autoContainmentEnabled}
                    onChange={(e) => setAutoContainmentEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Dispatch SOC Webhook Alerts</span>
                  <input
                    type="checkbox"
                    className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                    checked={notifySoc}
                    onChange={(e) => setNotifySoc(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save SOAR Rules
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Threat Incident Stream & SOAR Containment Audit */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Active Incidents Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" /> Active Security Threat Incidents ({incidents.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Threat & Target</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">SOAR Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {incidents.map((inc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-rose-300">{inc.incidentId}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{inc.threatType}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inc.sourceIp} &bull; {inc.targetUsername}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-rose-400">{inc.riskScore}/100</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inc.status === "CONTAINED" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/30" : inc.status === "RESOLVED" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400 border border-rose-500/30 animate-pulse"}`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {inc.status !== "RESOLVED" && (
                          <>
                            <button
                              type="button"
                              className="text-[10px] px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded"
                              onClick={() => handleContainmentAction(inc.incidentId, "IP_BAN")}
                            >
                              Ban IP
                            </button>
                            <button
                              type="button"
                              className="text-[10px] px-2 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 rounded"
                              onClick={() => handleContainmentAction(inc.incidentId, "ACCOUNT_LOCKOUT")}
                            >
                              Lock User
                            </button>
                            <button
                              type="button"
                              className="text-[10px] px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded"
                              onClick={() => handleResolveIncident(inc.incidentId)}
                            >
                              Resolve
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No active security incidents detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Containment Audit Trail */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={18} className="text-cyan-400" /> SOAR Containment Action Log ({containmentActions.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Executed By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Executed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {containmentActions.map((act, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{act.incidentId}</td>
                      <td className="p-3 font-semibold text-rose-300">{act.actionType}</td>
                      <td className="p-3 text-slate-300">{act.executedBy}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400">
                          {act.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {act.executedAt ? new Date(act.executedAt).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {containmentActions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No containment actions executed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
