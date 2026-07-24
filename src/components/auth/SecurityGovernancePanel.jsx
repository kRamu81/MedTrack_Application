import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  ShieldCheck,
  Award,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  FileSpreadsheet,
  Clock,
  Lock
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  runComplianceScan,
  getAllControls,
  getAllAuditReports
} from "../../services/SecurityGovernanceService";
import "../../pages/auth/auth.css";

export default function SecurityGovernancePanel() {
  const [policy, setPolicy] = useState(null);
  const [controls, setControls] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [hipaaEnabled, setHipaaEnabled] = useState(true);
  const [soc2Enabled, setSoc2Enabled] = useState(true);
  const [gdprEnabled, setGdprEnabled] = useState(true);
  const [passwordRotationDays, setPasswordRotationDays] = useState(90);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(15);
  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState(365);
  const [strictMfaRequired, setStrictMfaRequired] = useState(true);

  const loadGovernanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, ctrls, rpts] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllControls().catch(() => []),
        getAllAuditReports().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setHipaaEnabled(pol.hipaaComplianceEnabled);
        setSoc2Enabled(pol.soc2ComplianceEnabled);
        setGdprEnabled(pol.gdprComplianceEnabled);
        setPasswordRotationDays(pol.passwordRotationDays || 90);
        setSessionTimeoutMinutes(pol.sessionTimeoutMinutes || 15);
        setAuditLogRetentionDays(pol.auditLogRetentionDays || 365);
        setStrictMfaRequired(pol.strictMfaRequired);
      }

      setControls(ctrls);
      setReports(rpts);
    } catch (err) {
      console.error("Failed to load security governance data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGovernanceData();
  }, [loadGovernanceData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "ENTERPRISE_GOVERNANCE_POLICY",
        hipaaComplianceEnabled: hipaaEnabled,
        soc2ComplianceEnabled: soc2Enabled,
        gdprComplianceEnabled: gdprEnabled,
        passwordRotationDays: Number(passwordRotationDays),
        sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
        auditLogRetentionDays: Number(auditLogRetentionDays),
        strictMfaRequired
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Security governance policy rules updated!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update governance policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunScan = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const scanResult = await runComplianceScan();
      setMessage({ type: "success", text: `Compliance audit scan finished! Health Score: ${scanResult.complianceScore}%` });
      await loadGovernanceData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to run automated compliance scan." });
    } finally {
      setActionLoading(false);
    }
  };

  const passedControls = controls.filter((c) => c.passed).length;
  const healthScore = controls.length > 0 ? Math.round((passedControls * 100) / controls.length) : 100;

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-emerald-500/20 text-emerald-400">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Security Governance & Regulatory Compliance Engine</h2>
              <span className="authority-ver-badge bg-emerald-500/20 text-emerald-300">
                HEALTH SCORE: {healthScore}%
              </span>
            </div>
            <p className="authority-subtitle">
              Automated compliance auditing for HIPAA, SOC2 Type II, GDPR, and ISO27001 medical data standards
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-primary bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handleRunScan}
            disabled={actionLoading}
          >
            <Play size={16} /> Trigger Audit Scan
          </button>
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadGovernanceData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Governance Policy Form */}
        <div className="authority-card lg:col-span-1">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              <h3>Governance Rules</h3>
            </div>
          </div>

          <form onSubmit={handleUpdatePolicy} className="card-body space-y-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">HIPAA 164.312 Compliance</span>
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  checked={hipaaEnabled}
                  onChange={(e) => setHipaaEnabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">SOC2 Type II Trust Criteria</span>
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  checked={soc2Enabled}
                  onChange={(e) => setSoc2Enabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">GDPR Data Privacy Guard</span>
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  checked={gdprEnabled}
                  onChange={(e) => setGdprEnabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                <span className="text-slate-300 font-semibold">Strict Admin MFA Enforcement</span>
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  checked={strictMfaRequired}
                  onChange={(e) => setStrictMfaRequired(e.target.checked)}
                />
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password Rotation Interval (Days):
              </label>
              <input
                type="number"
                min="1"
                max="365"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                value={passwordRotationDays}
                onChange={(e) => setPasswordRotationDays(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Session Timeout (Minutes):
              </label>
              <input
                type="number"
                min="1"
                max="120"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Audit Trail Retention (Days):
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                value={auditLogRetentionDays}
                onChange={(e) => setAuditLogRetentionDays(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="authority-btn authority-btn-primary w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs mt-4"
              disabled={actionLoading}
            >
              Save Policy Parameters
            </button>
          </form>
        </div>

        {/* Right Column: Controls Table & Audit Scans */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Controls List Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-400" /> Regulatory Compliance Controls ({controls.length})
              </h3>
              <span className="text-xs text-slate-400">
                {passedControls} of {controls.length} Passing
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Control Code</th>
                    <th className="p-3">Control Description</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {controls.map((ctrl, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-emerald-300">{ctrl.controlCode}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{ctrl.controlName}</div>
                        <div className="text-[10px] text-slate-400">{ctrl.description}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-200 font-mono">
                          {ctrl.framework}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${ctrl.severity === "CRITICAL" ? "text-rose-400 bg-rose-950/40" : "text-amber-400 bg-amber-950/40"}`}>
                          {ctrl.severity}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${ctrl.passed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                          {ctrl.passed ? <Check size={12} /> : <X size={12} />}
                          {ctrl.passed ? "PASSING" : "FAILED"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {controls.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No compliance controls loaded. Trigger a scan or sync with server.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Reports Log */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-blue-400" /> Historical Compliance Audit Scans ({reports.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Scan Title</th>
                    <th className="p-3">Health Score</th>
                    <th className="p-3">Evaluated</th>
                    <th className="p-3">Overall Status</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.map((rpt, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 font-mono">
                      <td className="p-3 font-semibold text-white">{rpt.scanTitle}</td>
                      <td className="p-3 font-bold text-emerald-400">{rpt.complianceScore}%</td>
                      <td className="p-3 text-slate-300">{rpt.passedControlsCount}/{rpt.totalControlsEvaluated}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rpt.overallStatus === "COMPLIANT" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"}`}>
                          {rpt.overallStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {rpt.scannedAt ? new Date(rpt.scannedAt).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">
                        No audit reports generated yet. Click "Trigger Audit Scan" above.
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
