import { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Slash,
  PlusCircle,
  Cpu,
  Lock,
  History,
  FileCode
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  generateCryptoKey,
  rotateKey,
  revokeKey,
  getAllKeys,
  getAllAuditLogs
} from "../../services/SecurityKeyVaultService";
import "../../pages/auth/auth.css";

export default function SecurityKeyVaultPanel() {
  const [policy, setPolicy] = useState(null);
  const [keys, setKeys] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Key Vault Policy State
  const [keyRotationDays, setKeyRotationDays] = useState(90);
  const [defaultAlgorithm, setDefaultAlgorithm] = useState("AES-256-GCM");
  const [autoRotationEnabled, setAutoRotationEnabled] = useState(true);
  const [hsmEnabled, setHsmEnabled] = useState(true);
  const [exportAllowed, setExportAllowed] = useState(false);

  // New Key Generator Form State
  const [newAlias, setNewAlias] = useState("");
  const [newAlgorithm, setNewAlgorithm] = useState("AES-256-GCM");
  const [newKeyType, setNewKeyType] = useState("SYMMETRIC");

  const loadKeyVaultData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, keyList, logs] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllKeys().catch(() => []),
        getAllAuditLogs().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setKeyRotationDays(pol.keyRotationDays || 90);
        setDefaultAlgorithm(pol.defaultAlgorithm || "AES-256-GCM");
        setAutoRotationEnabled(pol.autoRotationEnabled);
        setHsmEnabled(pol.hardwareSecurityModuleEnabled);
        setExportAllowed(pol.exportKeysAllowed);
      }

      setKeys(keyList);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Failed to load key vault data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeyVaultData();
  }, [loadKeyVaultData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_KEY_VAULT_POLICY",
        keyRotationDays: Number(keyRotationDays),
        defaultAlgorithm,
        autoRotationEnabled,
        hardwareSecurityModuleEnabled: hsmEnabled,
        exportKeysAllowed: exportAllowed
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "Key Vault policy parameters saved successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update Key Vault policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newAlias.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const created = await generateCryptoKey({
        keyAlias: newAlias.trim().toUpperCase(),
        algorithm: newAlgorithm,
        keyType: newKeyType
      });

      setNewAlias("");
      setMessage({ type: "success", text: `Cryptographic key generated: ${created.keyId}` });
      await loadKeyVaultData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to generate key." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRotateKey = async (keyId) => {
    setActionLoading(true);
    try {
      const rotated = await rotateKey(keyId);
      setMessage({ type: "success", text: `Key ${keyId} rotated to version ${rotated.version}` });
      await loadKeyVaultData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to rotate cryptographic key." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    setActionLoading(true);
    try {
      await revokeKey(keyId);
      setMessage({ type: "warning", text: `Key ${keyId} permanently revoked.` });
      await loadKeyVaultData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to revoke cryptographic key." });
    } finally {
      setActionLoading(false);
    }
  };

  const activeKeysCount = keys.filter((k) => k.state === "ACTIVE").length;

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-cyan-500/20 text-cyan-400">
            <KeyRound size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Cryptographic Key Vault & HSM Governance</h2>
              <span className="authority-ver-badge bg-cyan-500/20 text-cyan-300">
                ACTIVE KEYS: {activeKeysCount}
              </span>
            </div>
            <p className="authority-subtitle">
              Hardware Security Module (HSM) key rotation, AES-256-GCM / RSA-4096 management, and cryptographic audit logs
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadKeyVaultData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Vault
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
        {/* Left Column: Key Generator & Policy Form */}
        <div className="space-y-6 lg:col-span-1">
          {/* Key Generator Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-cyan-400" />
                <h3>Generate New Key</h3>
              </div>
            </div>

            <form onSubmit={handleGenerateKey} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Alias:</label>
                <input
                  type="text"
                  placeholder="e.g. EHR-PAYMENT-VAULT-KEY"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono uppercase"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Algorithm:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    value={newAlgorithm}
                    onChange={(e) => setNewAlgorithm(e.target.value)}
                  >
                    <option value="AES-256-GCM">AES-256-GCM</option>
                    <option value="RSA-4096">RSA-4096</option>
                    <option value="ECC-P384">ECC-P384</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Key Type:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value)}
                  >
                    <option value="SYMMETRIC">SYMMETRIC</option>
                    <option value="ASYMMETRIC">ASYMMETRIC</option>
                    <option value="SIGNING">SIGNING</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Provision Cryptographic Key
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" />
                <h3>Vault Policies</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rotation Frequency (Days):</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  value={keyRotationDays}
                  onChange={(e) => setKeyRotationDays(e.target.value)}
                  required
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Enable Automated Key Rotation</span>
                  <input
                    type="checkbox"
                    className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                    checked={autoRotationEnabled}
                    onChange={(e) => setAutoRotationEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">HSM Integration Active</span>
                  <input
                    type="checkbox"
                    className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                    checked={hsmEnabled}
                    onChange={(e) => setHsmEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Allow Plaintext Key Export</span>
                  <input
                    type="checkbox"
                    className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                    checked={exportAllowed}
                    onChange={(e) => setExportAllowed(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Update Policy Settings
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Key Inventory & Audit Stream */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Key Inventory Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound size={18} className="text-cyan-400" /> Key Vault Inventory ({keys.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Key ID</th>
                    <th className="p-3">Key Alias</th>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Ver</th>
                    <th className="p-3">State</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {keys.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-cyan-300">{k.keyId}</td>
                      <td className="p-3 font-semibold text-white">{k.keyAlias}</td>
                      <td className="p-3 text-slate-300">{k.algorithm}</td>
                      <td className="p-3 text-amber-400">v{k.version}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${k.state === "ACTIVE" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : k.state === "ROTATED" ? "bg-amber-950 text-amber-400 border border-amber-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"}`}>
                          {k.state}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {k.state === "ACTIVE" && (
                          <>
                            <button
                              type="button"
                              className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                              onClick={() => handleRotateKey(k.keyId)}
                            >
                              <RotateCw size={11} /> Rotate
                            </button>
                            <button
                              type="button"
                              className="text-[11px] text-rose-400 hover:underline inline-flex items-center gap-1"
                              onClick={() => handleRevokeKey(k.keyId)}
                            >
                              <Slash size={11} /> Revoke
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                        No cryptographic keys in vault. Use the generator panel on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Stream */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={18} className="text-blue-400" /> Key Vault Lifecycle Audit Stream ({auditLogs.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Key ID</th>
                    <th className="p-3">Operation</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{log.keyId}</td>
                      <td className="p-3 font-semibold text-cyan-300">{log.operation}</td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === "SUCCESS" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No audit events recorded yet.
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
