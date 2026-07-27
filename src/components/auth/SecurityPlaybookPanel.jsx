import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Sliders,
  TrendingUp,
  Cpu,
  Lock,
  Workflow
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  triggerPlaybookExecution,
  getAllExecutions,
  getStepsByExecutionId
} from "../../services/SecurityPlaybookService";
import "../../pages/auth/auth.css";

export default function SecurityPlaybookPanel() {
  const [policy, setPolicy] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [triggerEvent, setTriggerEvent] = useState("BRUTE_FORCE");
  const [defaultAction, setDefaultAction] = useState("REVOKE_TOKENS_AND_BAN_IP");
  const [executionMode, setExecutionMode] = useState("AUTOMATIC");
  const [cooldownMinutes, setCooldownMinutes] = useState(15);
  const [notifySoc, setNotifySoc] = useState(true);

  // Trigger Playbook Form State
  const [targetAsset, setTargetAsset] = useState("");
  const [triggerNotes, setTriggerNotes] = useState("");

  const loadPlaybookData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, execList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllExecutions().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setTriggerEvent(pol.triggerEvent || "BRUTE_FORCE");
        setDefaultAction(pol.defaultContainmentAction || "REVOKE_TOKENS_AND_BAN_IP");
        setExecutionMode(pol.executionMode || "AUTOMATIC");
        setCooldownMinutes(pol.cooldownMinutes || 15);
        setNotifySoc(pol.notifySocOnExecution);
      }

      setExecutions(execList);
      if (execList.length > 0) {
        handleViewSteps(execList[0].executionId);
      }
    } catch (err) {
      console.error("Failed to load security playbook data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaybookData();
  }, [loadPlaybookData]);

  const handleViewSteps = async (execId) => {
    setSelectedExecution(execId);
    try {
      const steps = await getStepsByExecutionId(execId);
      setExecutionSteps(steps);
    } catch (err) {
      console.error("Failed to fetch step logs:", err);
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        playbookName: "MASTER_CONTAINMENT_PLAYBOOK",
        triggerEvent,
        defaultContainmentAction: defaultAction,
        executionMode,
        cooldownMinutes: Number(cooldownMinutes),
        notifySocOnExecution: notifySoc
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Automated SOAR playbook policies updated!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerPlaybook = async (e) => {
    e.preventDefault();
    if (!targetAsset.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const exec = await triggerPlaybookExecution({
        playbookName: "MASTER_CONTAINMENT_PLAYBOOK",
        triggerEvent,
        affectedAsset: targetAsset.trim(),
        customNotes: triggerNotes.trim() || undefined
      });

      setTargetAsset("");
      setTriggerNotes("");
      setMessage({ type: "success", text: `Playbook Executed! Execution ID: ${exec.executionId}` });
      await loadPlaybookData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to trigger playbook." });
    } finally {
      setActionLoading(false);
    }
  };

  const successfulRuns = executions.filter((e) => e.executionStatus === "SUCCESS").length;

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-rose-500/20 text-rose-400">
            <Zap size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Automated SOAR Threat Containment Playbooks</h2>
              <span className="authority-ver-badge bg-rose-500/20 text-rose-300">
                PLAYBOOK ENGINE ACTIVE: {successfulRuns} EXECUTIONS SUCCESSFUL
              </span>
            </div>
            <p className="authority-subtitle">
              Automated incident containment workflows, IP/user lockouts, and SOAR orchestration rules
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadPlaybookData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Playbooks
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
        {/* Left Column: Trigger Playbook Simulator & Policy Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Playbook Execution Form */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-rose-400" />
                <h3>Trigger Containment Playbook</h3>
              </div>
            </div>

            <form onSubmit={handleTriggerPlaybook} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Affected Asset:</label>
                <input
                  type="text"
                  placeholder="e.g. user:sarah.connor or ip:192.168.1.105"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Triggering Security Event:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                >
                  <option value="BRUTE_FORCE">BRUTE FORCE ATTACK</option>
                  <option value="UNAUTHORIZED_ROLE_ESCALATION">UNAUTHORIZED PRIVILEGE ESCALATION</option>
                  <option value="RANSOMWARE_BEHAVIOR">ANOMALOUS DATA EXTRACTION</option>
                  <option value="ANOMALOUS_API_RATE">SUSPICIOUS API RATE EXCEEDED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Notes & Evidence:</label>
                <textarea
                  rows={2}
                  placeholder="Custom incident investigation notes..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                  value={triggerNotes}
                  onChange={(e) => setTriggerNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-rose-600 hover:bg-rose-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Execute Containment Playbook
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-rose-400" />
                <h3>SOAR Containment Policy</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Containment Action:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  value={defaultAction}
                  onChange={(e) => setDefaultAction(e.target.value)}
                >
                  <option value="REVOKE_TOKENS_AND_BAN_IP">REVOKE TOKENS & BAN IP</option>
                  <option value="ISOLATE_HOST">ISOLATE HOST ENDPOINT</option>
                  <option value="SUSPEND_USER">SUSPEND USER ACCOUNT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Execution Mode:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    value={executionMode}
                    onChange={(e) => setExecutionMode(e.target.value)}
                  >
                    <option value="AUTOMATIC">AUTOMATIC</option>
                    <option value="SEMI_AUTOMATIC">SEMI AUTOMATIC</option>
                    <option value="MANUAL_APPROVAL">MANUAL APPROVAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cooldown (Mins):</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    value={cooldownMinutes}
                    onChange={(e) => setCooldownMinutes(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Notify SOC Lead On Execution</span>
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

        {/* Right Column: Executions History & Step Action Logs */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Playbook Executions Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow size={18} className="text-rose-400" /> Historical Playbook Executions ({executions.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Execution ID</th>
                    <th className="p-3">Trigger Event</th>
                    <th className="p-3">Target Asset</th>
                    <th className="p-3">Action</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {executions.map((e, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/50 cursor-pointer ${selectedExecution === e.executionId ? "bg-slate-800/80" : ""}`}
                      onClick={() => handleViewSteps(e.executionId)}
                    >
                      <td className="p-3 font-bold text-rose-300">{e.executionId}</td>
                      <td className="p-3 font-semibold text-white">{e.triggerEvent}</td>
                      <td className="p-3 text-amber-300">{e.affectedAsset}</td>
                      <td className="p-3 text-slate-400 text-[10px]">{e.executedAction}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {e.executionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {executions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No playbook executions logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Granular Step Action Logs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-amber-400" /> Playbook Step Logs: {selectedExecution || "None Selected"}
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Step ID</th>
                    <th className="p-3">Step Action Name</th>
                    <th className="p-3">Step Log Details</th>
                    <th className="p-3 text-right">Step Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {executionSteps.map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-amber-300">{st.stepId}</td>
                      <td className="p-3 font-semibold text-white">{st.stepName}</td>
                      <td className="p-3 text-slate-300 font-sans text-[11px]">{st.stepDetails}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {st.stepStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {executionSteps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500 font-sans">
                        Select an execution run above to inspect step logs.
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
