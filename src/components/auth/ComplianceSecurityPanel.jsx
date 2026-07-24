import { useState, useEffect, useCallback } from "react";
import {
  Award,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  PlusCircle,
  Check,
  Building2,
  FileCode,
  Sliders
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  runComplianceAudit,
  recordControlEvidence,
  getAllAuditReports,
  getAllControlItems
} from "../../services/ComplianceSecurityService";
import "../../pages/auth/auth.css";

export default function ComplianceSecurityPanel() {
  const [policy, setPolicy] = useState(null);
  const [reports, setReports] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [activeFramework, setActiveFramework] = useState("SOC2_TYPE2");
  const [retentionDays, setRetentionDays] = useState(365);
  const [autoAuditScheduled, setAutoAuditScheduled] = useState(true);
  const [enforceStrictEvidence, setEnforceStrictEvidence] = useState(true);

  // New Control Evidence Form State
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newFramework, setNewFramework] = useState("SOC2_TYPE2");
  const [newStatus, setNewStatus] = useState("COMPLIANT");
  const [newEvidence, setNewEvidence] = useState("");

  const loadComplianceData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, reportList, controlList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllAuditReports().catch(() => []),
        getAllControlItems().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setActiveFramework(pol.activeFramework || "SOC2_TYPE2");
        setRetentionDays(pol.dataRetentionDays || 365);
        setAutoAuditScheduled(pol.autoAuditScheduled);
        setEnforceStrictEvidence(pol.enforceStrictEvidenceLogs);
      }

      setReports(reportList);
      setControls(controlList);
    } catch (err) {
      console.error("Failed to load compliance audit data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_COMPLIANCE_POLICY",
        activeFramework,
        dataRetentionDays: Number(retentionDays),
        autoAuditScheduled,
        enforceStrictEvidenceLogs: enforceStrictEvidence
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Regulatory compliance policy parameters saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const report = await runComplianceAudit({
        frameworkStandard: activeFramework,
        evaluatorNotes: `Automated ${activeFramework} compliance audit evaluation run`
      });

      setMessage({ type: "success", text: `Audit completed! Status: ${report.status} (${report.complianceScorePercentage.toFixed(1)}%)` });
      await loadComplianceData();
    } catch (err) {
      setMessage({ type: "error", text: "Compliance audit run failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordEvidence = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const recorded = await recordControlEvidence({
        controlCode: newCode.trim().toUpperCase(),
        controlName: newName.trim(),
        framework: newFramework,
        status: newStatus,
        evidenceDetails: newEvidence.trim() || "Proof of compliance recorded by auditor"
      });

      setNewCode("");
      setNewName("");
      setNewEvidence("");
      setMessage({ type: "success", text: `Recorded evidence for ${recorded.controlCode}` });
      await loadComplianceData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to record control evidence." });
    } finally {
      setActionLoading(false);
    }
  };

  const compliantCount = controls.filter((c) => c.status === "COMPLIANT").length;
  const totalCount = controls.length;
  const compliancePercentage = totalCount > 0 ? ((compliantCount / totalCount) * 100).toFixed(1) : "100.0";

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-indigo-500/20 text-indigo-400">
            <Award size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Regulatory Compliance & Automated Audit Subsystem</h2>
              <span className="authority-ver-badge bg-indigo-500/20 text-indigo-300">
                SCORE: {compliancePercentage}% ({compliantCount}/{totalCount} COMPLIANT)
              </span>
            </div>
            <p className="authority-subtitle">
              SOC2 Type II, HIPAA HITECH, GDPR Article 32, and ISO 27001 automated compliance auditing and evidence collection
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={handleRunAudit}
            disabled={actionLoading}
          >
            <Play size={16} /> Run Framework Audit
          </button>
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadComplianceData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Framework
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
        {/* Left Column: Evidence Ingestion & Policy Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Control Evidence Ingestion Form */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-indigo-400" />
                <h3>Record Control Evidence</h3>
              </div>
            </div>

            <form onSubmit={handleRecordEvidence} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Control Code:</label>
                <input
                  type="text"
                  placeholder="e.g. SOC2-CC6.1 or HIPAA-164.312"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Control Title:</label>
                <input
                  type="text"
                  placeholder="Access Control & RBAC Policy"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Framework:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={newFramework}
                    onChange={(e) => setNewFramework(e.target.value)}
                  >
                    <option value="SOC2_TYPE2">SOC2_TYPE2</option>
                    <option value="HIPAA_HITECH">HIPAA_HITECH</option>
                    <option value="GDPR_ARTICLE32">GDPR_ARTICLE32</option>
                    <option value="ISO_27001">ISO_27001</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proof / Evidence Details:</label>
                <textarea
                  rows={2}
                  placeholder="Verification details or KeyVault log references..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Ingest Control Proof
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-indigo-400" />
                <h3>Regulatory Policy Rules</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Framework:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={activeFramework}
                  onChange={(e) => setActiveFramework(e.target.value)}
                >
                  <option value="SOC2_TYPE2">SOC2 TYPE II</option>
                  <option value="HIPAA_HITECH">HIPAA HITECH</option>
                  <option value="GDPR_ARTICLE32">GDPR ARTICLE 32</option>
                  <option value="ISO_27001">ISO 27001</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Evidence Retention (Days):</label>
                <input
                  type="number"
                  min="30"
                  max="3650"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Scheduled Compliance Scans</span>
                  <input
                    type="checkbox"
                    className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    checked={autoAuditScheduled}
                    onChange={(e) => setAutoAuditScheduled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Enforce Strict Evidence Logging</span>
                  <input
                    type="checkbox"
                    className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                    checked={enforceStrictEvidence}
                    onChange={(e) => setEnforceStrictEvidence(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save Regulatory Rules
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Framework Controls & Audit History Table */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Controls Evidence Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-400" /> Granular Compliance Control Items ({controls.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Control Code</th>
                    <th className="p-3">Control Title & Proof</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {controls.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-indigo-300">{c.controlCode}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{c.controlName}</div>
                        <div className="text-[10px] text-slate-400">{c.evidenceDetails}</div>
                      </td>
                      <td className="p-3 text-slate-300 text-[10px]">{c.framework}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === "COMPLIANT" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {controls.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500 font-sans">
                        No compliance controls evaluated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Reports Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-400" /> Historical Regulatory Audit Reports ({reports.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Report ID</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3">Compliance Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Evaluated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {reports.map((rep, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{rep.reportId}</td>
                      <td className="p-3 text-indigo-300">{rep.frameworkStandard}</td>
                      <td className="p-3 font-bold text-emerald-400">{rep.complianceScorePercentage?.toFixed(1)}%</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {rep.auditDate ? new Date(rep.auditDate).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No audit reports generated yet.
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
