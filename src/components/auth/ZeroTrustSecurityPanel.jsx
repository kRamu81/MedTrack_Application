import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Globe,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Unlock,
  Lock,
  Zap,
  Activity,
  UserX,
  Search
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  evaluateIpThreat,
  recordFailedAttempt,
  unblockIp,
  getAllIpThreatLogs,
  getAllViolations
} from "../../services/ZeroTrustSecurityService";
import "../../pages/auth/auth.css";

export default function ZeroTrustSecurityPanel() {
  const [policy, setPolicy] = useState(null);
  const [threatLogs, setThreatLogs] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [maxFailedThreshold, setMaxFailedThreshold] = useState(5);
  const [blockDurationMinutes, setBlockDurationMinutes] = useState(30);
  const [geoFencingEnabled, setGeoFencingEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [anomalyDetectionEnabled, setAnomalyDetectionEnabled] = useState(true);

  // Evaluator Sandbox State
  const [testIp, setTestIp] = useState("192.168.1.105");
  const [testCountry, setTestCountry] = useState("US");
  const [evalResult, setEvalResult] = useState(null);

  const loadZeroTrustData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, logs, viols] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllIpThreatLogs().catch(() => []),
        getAllViolations().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setMaxFailedThreshold(pol.maxFailedAttemptsThreshold || 5);
        setBlockDurationMinutes(pol.ipBlockDurationMinutes || 30);
        setGeoFencingEnabled(pol.geoFencingEnabled);
        setIpWhitelistEnabled(pol.ipWhitelistEnabled);
        setAnomalyDetectionEnabled(pol.anomalyDetectionEnabled);
      }

      setThreatLogs(logs);
      setViolations(viols);
    } catch (err) {
      console.error("Failed to load zero trust security data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZeroTrustData();
  }, [loadZeroTrustData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "DEFAULT_ZERO_TRUST_POLICY",
        maxFailedAttemptsThreshold: Number(maxFailedThreshold),
        ipBlockDurationMinutes: Number(blockDurationMinutes),
        geoFencingEnabled,
        ipWhitelistEnabled,
        anomalyDetectionEnabled
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Zero-Trust policy rules updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update zero trust policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvaluateIp = async (e) => {
    e.preventDefault();
    if (!testIp.trim()) return;

    setActionLoading(true);
    try {
      const res = await evaluateIpThreat(testIp.trim(), testCountry.trim());
      setEvalResult(res);
      await loadZeroTrustData();
    } catch (err) {
      setMessage({ type: "error", text: "IP threat evaluation failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateFailure = async (ip) => {
    setActionLoading(true);
    try {
      const res = await recordFailedAttempt(ip);
      setEvalResult(res);
      setMessage({ type: "warning", text: `Simulated failed login recorded for IP ${ip}` });
      await loadZeroTrustData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to record failure attempt." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (ip) => {
    setActionLoading(true);
    try {
      const res = await unblockIp(ip);
      setMessage({ type: "success", text: `IP address ${ip} unblocked successfully.` });
      if (evalResult?.ipAddress === ip) setEvalResult(res);
      await loadZeroTrustData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to unblock IP address." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-rose-500/20 text-rose-400">
            <ShieldAlert size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Zero-Trust Security Guard & Anomaly Engine</h2>
              <span className="authority-ver-badge bg-rose-500/20 text-rose-300">
                ACTIVE THREAT PROTECTION
              </span>
            </div>
            <p className="authority-subtitle">
              Real-time IP threat intelligence, rate-limit enforcement, geo-fencing policies, and automated threat score evaluations
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadZeroTrustData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Intelligence
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : message.type === "warning" ? "bg-amber-950/40 border-amber-500/30 text-amber-300" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Policy Configuration Controls */}
        <div className="authority-card lg:col-span-1">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-rose-400" />
              <h3>Policy Controls</h3>
            </div>
          </div>

          <form onSubmit={handleUpdatePolicy} className="card-body space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Max Failed Login Threshold:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                value={maxFailedThreshold}
                onChange={(e) => setMaxFailedThreshold(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                IP Block Duration (Minutes):
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                value={blockDurationMinutes}
                onChange={(e) => setBlockDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">Enable Geo-Fencing Checks</span>
                <input
                  type="checkbox"
                  className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                  checked={geoFencingEnabled}
                  onChange={(e) => setGeoFencingEnabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">IP Whitelist Enforcement</span>
                <input
                  type="checkbox"
                  className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                  checked={ipWhitelistEnabled}
                  onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">Anomaly Behavior Detection</span>
                <input
                  type="checkbox"
                  className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                  checked={anomalyDetectionEnabled}
                  onChange={(e) => setAnomalyDetectionEnabled(e.target.checked)}
                />
              </label>
            </div>

            <button
              type="submit"
              className="authority-btn authority-btn-primary w-full bg-rose-600 hover:bg-rose-500 text-white text-xs mt-4"
              disabled={actionLoading}
            >
              Update Zero-Trust Rules
            </button>
          </form>
        </div>

        {/* Right Column: Evaluator Sandbox & Threat Log Stream */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* IP Evaluation Sandbox */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-400" /> Real-Time IP Threat Intelligence Sandbox
            </h3>

            <form onSubmit={handleEvaluateIp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="e.g. 192.168.1.100"
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                value={testIp}
                onChange={(e) => setTestIp(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Country Code (e.g. US)"
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase font-mono"
                value={testCountry}
                onChange={(e) => setTestCountry(e.target.value)}
              />

              <button type="submit" className="authority-btn authority-btn-secondary text-xs" disabled={actionLoading}>
                Evaluate Threat
              </button>
            </form>

            {evalResult && (
              <div className={`p-4 rounded-2xl border space-y-3 ${evalResult.blocked ? "bg-red-950/40 border-red-500/40 text-red-300" : "bg-slate-800 border-slate-700 text-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-rose-400" />
                    <span className="font-mono font-bold text-sm">{evalResult.ipAddress}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {evalResult.countryCode}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${evalResult.blocked ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                    {evalResult.blocked ? "RESTRICTED / BLOCKED" : "CLEAR / ALLOWED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>Threat Score: <span className="text-amber-400 font-bold">{evalResult.threatScore}/100</span></div>
                  <div>Level: <span className="text-rose-400 font-bold">{evalResult.threatLevel}</span></div>
                  <div>Failed Attempts: <span className="text-white font-bold">{evalResult.failedAttemptsCount}</span></div>
                  <div>State: <span className="text-slate-300">{evalResult.decisionMessage}</span></div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="authority-btn authority-btn-secondary text-[11px] py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30"
                    onClick={() => handleSimulateFailure(evalResult.ipAddress)}
                  >
                    Simulate Failed Login
                  </button>

                  {evalResult.blocked && (
                    <button
                      type="button"
                      className="authority-btn authority-btn-secondary text-[11px] py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                      onClick={() => handleUnblock(evalResult.ipAddress)}
                    >
                      <Unlock size={12} /> Unblock IP Address
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recorded IP Threat Intelligence Stream Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-rose-400" /> Recorded Threat Intelligence Logs ({threatLogs.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Threat Score</th>
                    <th className="p-3">Failed Attempts</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {threatLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 font-mono">
                      <td className="p-3 font-bold text-white">{log.ipAddress}</td>
                      <td className="p-3">{log.countryCode || "US"}</td>
                      <td className="p-3">
                        <span className={`font-bold ${log.threatScore > 50 ? "text-red-400" : "text-amber-400"}`}>
                          {log.threatScore}/100
                        </span>
                      </td>
                      <td className="p-3">{log.failedAttemptsCount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.blocked ? "bg-red-950 text-red-400 border border-red-500/30" : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"}`}>
                          {log.blocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {log.blocked ? (
                          <button
                            type="button"
                            className="text-[11px] text-emerald-400 hover:underline"
                            onClick={() => handleUnblock(log.ipAddress)}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-[11px] text-amber-400 hover:underline"
                            onClick={() => handleSimulateFailure(log.ipAddress)}
                          >
                            Simulate Fail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {threatLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                        No threat intelligence logs recorded yet. Use the sandbox above to evaluate IP threat status.
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
