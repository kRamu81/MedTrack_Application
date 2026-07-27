import { useState, useEffect, useCallback } from "react";
import {
  FileCheck,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCode,
  Sliders,
  TrendingUp,
  Database,
  Key,
  ShieldCheck
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  ingestEvidenceRecord,
  verifyEvidenceChain,
  getAllRecords,
  getAllChainLogs
} from "../../services/ComplianceEvidenceService";
import "../../pages/auth/auth.css";

export default function ComplianceEvidencePanel() {
  const [policy, setPolicy] = useState(null);
  const [records, setRecords] = useState([]);
  const [chainLogs, setChainLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [frameworkStandard, setFrameworkStandard] = useState("SOC2");
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [wormEnabled, setWormEnabled] = useState(true);
  const [retentionYears, setRetentionYears] = useState(7);
  const [autoVerify, setAutoVerify] = useState(true);

  // Evidence Ingestion Form State
  const [controlReference, setControlReference] = useState("");
  const [evidenceType, setEvidenceType] = useState("LOG_EXPORT");
  const [storageUri, setStorageUri] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");

  const loadEvidenceData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, recList, blockList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllRecords().catch(() => []),
        getAllChainLogs().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setFrameworkStandard(pol.defaultFrameworkStandard || "SOC2");
        setHashAlgorithm(pol.hashAlgorithm || "SHA-256");
        setWormEnabled(pol.wormStorageEnabled);
        setRetentionYears(pol.retentionYears || 7);
        setAutoVerify(pol.autoChainVerificationEnabled);
      }

      setRecords(recList);
      setChainLogs(blockList);
    } catch (err) {
      console.error("Failed to load compliance evidence vault data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvidenceData();
  }, [loadEvidenceData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_EVIDENCE_POLICY",
        defaultFrameworkStandard: frameworkStandard,
        hashAlgorithm,
        wormStorageEnabled: wormEnabled,
        retentionYears: Number(retentionYears),
        autoChainVerificationEnabled: autoVerify
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Compliance Evidence Vault policies saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIngestEvidence = async (e) => {
    e.preventDefault();
    if (!controlReference.trim() || !storageUri.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const ingested = await ingestEvidenceRecord({
        frameworkStandard,
        controlReference: controlReference.trim(),
        evidenceType,
        storageUri: storageUri.trim(),
        evidenceDescription: evidenceDescription.trim() || undefined
      });

      setControlReference("");
      setStorageUri("");
      setEvidenceDescription("");
      setMessage({ type: "success", text: `Evidence Ingested & Block Sealed! ID: ${ingested.evidenceId}` });
      await loadEvidenceData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to ingest evidence." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyChain = async (evidenceId) => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await verifyEvidenceChain({ evidenceId });
      setMessage({ type: "success", text: `Block Integrity Verified! Status: ${result.ledgerStatus} (Sig: ${result.chainSignature})` });
    } catch (err) {
      setMessage({ type: "error", text: "Cryptographic chain verification failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const verifiedCount = records.filter((r) => r.verificationStatus === "VERIFIED").length;

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-blue-500/20 text-blue-400">
            <Lock size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Compliance Evidence Vault & Cryptographic Audit Chain</h2>
              <span className="authority-ver-badge bg-blue-500/20 text-blue-300">
                WORM VAULT ACTIVE: {verifiedCount} VERIFIED EVIDENCE BLOCKS ({chainLogs.length} BLOCKS SEALED)
              </span>
            </div>
            <p className="authority-subtitle">
              Immutable Write-Once-Read-Many (WORM) audit evidence storage and SHA-256 cryptographic chain block verification
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadEvidenceData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Ledger
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
        {/* Left Column: Ingest Evidence Simulator & WORM Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Ingest Evidence Form */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-400" />
                <h3>Ingest Audit Evidence</h3>
              </div>
            </div>

            <form onSubmit={handleIngestEvidence} className="card-body space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Framework:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={frameworkStandard}
                    onChange={(e) => setFrameworkStandard(e.target.value)}
                  >
                    <option value="SOC2">SOC2 TYPE II</option>
                    <option value="HIPAA">HIPAA SEC RULE</option>
                    <option value="ISO27001">ISO 27001</option>
                    <option value="GDPR">GDPR COMPLIANCE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Evidence Type:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                  >
                    <option value="LOG_EXPORT">LOG EXPORT</option>
                    <option value="ACCESS_MATRIX">ACCESS MATRIX</option>
                    <option value="AUDIT_TRAIL_DUMP">AUDIT TRAIL DUMP</option>
                    <option value="CONFIG_SNAPSHOT">CONFIG SNAPSHOT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Control Reference ID:</label>
                <input
                  type="text"
                  placeholder="e.g. CC6.1 or HIPAA-164.312"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  value={controlReference}
                  onChange={(e) => setControlReference(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WORM Storage URI:</label>
                <input
                  type="text"
                  placeholder="s3://medtrack-evidence-vault/soc2/..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  value={storageUri}
                  onChange={(e) => setStorageUri(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence Description & Proof:</label>
                <textarea
                  rows={2}
                  placeholder="Proof details recorded for compliance audit..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Ingest & Seal Block
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-blue-400" />
                <h3>WORM Vault Policy</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hash Algorithm:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={hashAlgorithm}
                  onChange={(e) => setHashAlgorithm(e.target.value)}
                >
                  <option value="SHA-256">SHA-256 CRYPTOGRAPHIC</option>
                  <option value="SHA-512">SHA-512 HIGH SECURITY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Retention Period (Years):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(e.target.value)}
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Enable WORM Immutability</span>
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
                    checked={wormEnabled}
                    onChange={(e) => setWormEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Auto-Verify Audit Chain</span>
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
                    checked={autoVerify}
                    onChange={(e) => setAutoVerify(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save Vault Config
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Ingested Records & Cryptographic Audit Chain Ledger */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Evidence Records Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck size={18} className="text-blue-400" /> Ingested WORM Evidence Records ({records.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Evidence ID</th>
                    <th className="p-3">Control Ref & Type</th>
                    <th className="p-3">SHA-256 Hash</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-blue-300">{r.evidenceId}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{r.controlReference}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.evidenceType}</div>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px] truncate max-w-[120px]">{r.fileHashSha256}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {r.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[10px] border border-slate-700 transition"
                          onClick={() => handleVerifyChain(r.evidenceId)}
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        No audit evidence records ingested.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic Audit Chain Ledger */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> Cryptographic Audit Chain Ledger ({chainLogs.length} Blocks)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Block #</th>
                    <th className="p-3">Evidence Ref</th>
                    <th className="p-3">Current Hash</th>
                    <th className="p-3">Previous Hash</th>
                    <th className="p-3 text-right">Ledger Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {chainLogs.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-emerald-400">#{b.blockIndex}</td>
                      <td className="p-3 text-blue-300">{b.evidenceId}</td>
                      <td className="p-3 text-slate-300 text-[10px] truncate max-w-[100px]">{b.currentHash}</td>
                      <td className="p-3 text-slate-500 text-[10px] truncate max-w-[100px]">{b.previousHash}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {b.ledgerStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {chainLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No audit chain blocks sealed yet.
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
