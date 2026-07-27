import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  PlusCircle,
  BarChart3,
  Sliders,
  TrendingUp
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  runPostureEvaluation,
  recordPostureCheck,
  getAllEvaluations,
  getAllControlAssessments
} from "../../services/SecurityPostureService";
import "../../pages/auth/auth.css";

export default function SecurityPosturePanel() {
  const [policy, setPolicy] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [activeBenchmark, setActiveBenchmark] = useState("CIS_BENCHMARK");
  const [minScoreThreshold, setMinScoreThreshold] = useState(85);
  const [autoAssessmentEnabled, setAutoAssessmentEnabled] = useState(true);
  const [notifyBreaches, setNotifyBreaches] = useState(true);

  // New Control Check Form State
  const [newControlId, setNewControlId] = useState("");
  const [newControlName, setNewControlName] = useState("");
  const [newCategory, setNewCategory] = useState("IAM_GOVERNANCE");
  const [newStatus, setNewStatus] = useState("COMPLIANT");
  const [newEvidence, setNewEvidence] = useState("");

  const loadPostureData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, evalList, controlList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllEvaluations().catch(() => []),
        getAllControlAssessments().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setActiveBenchmark(pol.activeBenchmarkStandard || "CIS_BENCHMARK");
        setMinScoreThreshold(pol.minimumScoreThreshold || 85);
        setAutoAssessmentEnabled(pol.automatedAssessmentEnabled);
        setNotifyBreaches(pol.notifyRiskThresholdBreaches);
      }

      setEvaluations(evalList);
      setControls(controlList);
    } catch (err) {
      console.error("Failed to load security posture data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPostureData();
  }, [loadPostureData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_POSTURE_POLICY",
        activeBenchmarkStandard: activeBenchmark,
        minimumScoreThreshold: Number(minScoreThreshold),
        automatedAssessmentEnabled: autoAssessmentEnabled,
        notifyRiskThresholdBreaches: notifyBreaches
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Security posture benchmark policy rules saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const evalRun = await runPostureEvaluation({
        benchmarkStandard: activeBenchmark,
        evaluationNotes: `Automated real-time ${activeBenchmark} security posture evaluation`
      });

      setMessage({ type: "success", text: `Evaluation Complete! Score: ${evalRun.overallPostureScore.toFixed(1)}% (${evalRun.riskRating})` });
      await loadPostureData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to execute posture evaluation." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordCheck = async (e) => {
    e.preventDefault();
    if (!newControlId.trim() || !newControlName.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const recorded = await recordPostureCheck({
        controlId: newControlId.trim().toUpperCase(),
        controlName: newControlName.trim(),
        domainCategory: newCategory,
        complianceStatus: newStatus,
        evidenceDetails: newEvidence.trim() || "Control check logged by security sensor"
      });

      setNewControlId("");
      setNewControlName("");
      setNewEvidence("");
      setMessage({ type: "success", text: `Recorded control check for ${recorded.controlId}` });
      await loadPostureData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to record control check." });
    } finally {
      setActionLoading(false);
    }
  };

  const compliantCount = controls.filter((c) => c.complianceStatus === "COMPLIANT").length;
  const totalCount = controls.length;
  const currentScore = totalCount > 0 ? ((compliantCount / totalCount) * 100).toFixed(1) : "100.0";

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-emerald-500/20 text-emerald-400">
            <Activity size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Enterprise Security Posture & Cyber Risk Engine</h2>
              <span className="authority-ver-badge bg-emerald-500/20 text-emerald-300">
                POSTURE SCORE: {currentScore}% ({compliantCount}/{totalCount} DOMAIN CHECKS COMPLIANT)
              </span>
            </div>
            <p className="authority-subtitle">
              CIS Benchmark v8, NIST 800-53, and HIPAA real-time cyber security posture scorecards and risk evaluation
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-primary bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handleRunEvaluation}
            disabled={actionLoading}
          >
            <Play size={16} /> Run Posture Scan
          </button>
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadPostureData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Benchmarks
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
        {/* Left Column: Posture Check Simulator & Policy Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Posture Check Ingestion Form */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-emerald-400" />
                <h3>Ingest Posture Check</h3>
              </div>
            </div>

            <form onSubmit={handleRecordCheck} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Control ID:</label>
                <input
                  type="text"
                  placeholder="e.g. CIS-1.1 or NIST-AC-2"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                  value={newControlId}
                  onChange={(e) => setNewControlId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Control Name:</label>
                <input
                  type="text"
                  placeholder="e.g. KeyVault KMS Encryption Check"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newControlName}
                  onChange={(e) => setNewControlName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Domain Category:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="IAM_GOVERNANCE">IAM_GOVERNANCE</option>
                    <option value="ENCRYPTION_HEALTH">ENCRYPTION_HEALTH</option>
                    <option value="NETWORK_PERIMETER">NETWORK_PERIMETER</option>
                    <option value="VULNERABILITY_HEALTH">VULNERABILITY_HEALTH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Compliance Status:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="NEEDS_REMEDIATION">NEEDS_REMEDIATION</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence Details:</label>
                <textarea
                  rows={2}
                  placeholder="Verification log proof..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Log Control Check
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-emerald-400" />
                <h3>Benchmark Policy Rules</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Benchmark Standard:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  value={activeBenchmark}
                  onChange={(e) => setActiveBenchmark(e.target.value)}
                >
                  <option value="CIS_BENCHMARK">CIS BENCHMARK V8</option>
                  <option value="NIST_800_53">NIST SP 800-53</option>
                  <option value="ISO_27001">ISO/IEC 27001</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Score Threshold (%):</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  value={minScoreThreshold}
                  onChange={(e) => setMinScoreThreshold(e.target.value)}
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Automated Posture Scans</span>
                  <input
                    type="checkbox"
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    checked={autoAssessmentEnabled}
                    onChange={(e) => setAutoAssessmentEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Notify Risk Breaches</span>
                  <input
                    type="checkbox"
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    checked={notifyBreaches}
                    onChange={(e) => setNotifyBreaches(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save Posture Rules
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Posture Control Checks & Evaluation History */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Control Checks Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-400" /> Posture Domain Control Checks ({controls.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Control ID</th>
                    <th className="p-3">Control Title & Proof</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {controls.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-emerald-300">{c.controlId}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{c.controlName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.evidenceDetails}</div>
                      </td>
                      <td className="p-3 text-slate-300 text-[10px]">{c.domainCategory}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.complianceStatus === "COMPLIANT" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"}`}>
                          {c.complianceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {controls.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500 font-sans">
                        No posture control checks recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Evaluation Scans */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-400" /> Historical Posture Evaluation Runs ({evaluations.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Evaluation ID</th>
                    <th className="p-3">Benchmark</th>
                    <th className="p-3">Posture Score</th>
                    <th className="p-3">Risk Rating</th>
                    <th className="p-3 text-right">Evaluated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {evaluations.map((ev, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{ev.evaluationId}</td>
                      <td className="p-3 text-emerald-300">{ev.benchmarkStandard}</td>
                      <td className="p-3 font-bold text-emerald-400">{ev.overallPostureScore?.toFixed(1)}%</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {ev.riskRating}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {ev.evaluationTimestamp ? new Date(ev.evaluationTimestamp).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {evaluations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No posture evaluations executed yet.
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
