import { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  ShieldCheck,
  QrCode,
  Key,
  Laptop,
  Globe,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Lock,
  LogOut,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  setupMfa,
  verifyMfa,
  getMfaStatus,
  disableMfa,
  getActiveDevices,
  revokeDeviceSession,
  revokeAllOtherDevices
} from "../../services/MfaService";
import "../../pages/auth/auth.css";

export default function MfaDeviceSecurityPanel() {
  const { user } = useAuth();

  const [mfaStatus, setMfaStatus] = useState(null);
  const [activeDevices, setActiveDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadMfaAndDevices = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const [statusRes, devicesRes] = await Promise.all([
        getMfaStatus(user.id).catch(() => null),
        getActiveDevices(user.id).catch(() => [])
      ]);

      if (statusRes) setMfaStatus(statusRes);
      if (devicesRes) setActiveDevices(devicesRes);
    } catch (err) {
      console.error("Error loading MFA & device security data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMfaAndDevices();
  }, [loadMfaAndDevices]);

  const handleInitiateSetup = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await setupMfa(user.id);
      setSetupData(res);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to initiate MFA setup." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length < 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit TOTP verification code." });
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await verifyMfa({
        userId: user.id,
        code: verificationCode.trim()
      });

      if (res.success) {
        setMessage({ type: "success", text: "Multi-Factor Authentication (2FA) activated successfully!" });
        setSetupData(null);
        setVerificationCode("");
        await loadMfaAndDevices();
      } else {
        setMessage({ type: "error", text: res.message || "Invalid verification code." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "MFA verification failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.")) {
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await disableMfa(user.id);
      if (res.success) {
        setMessage({ type: "success", text: "Multi-Factor Authentication has been disabled." });
        await loadMfaAndDevices();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to disable MFA." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    setActionLoading(true);
    try {
      const res = await revokeDeviceSession({ userId: user.id, deviceId });
      if (res.success) {
        setMessage({ type: "success", text: "Device session revoked." });
        await loadMfaAndDevices();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to revoke device session." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeOtherDevices = async () => {
    if (!window.confirm("Terminate all active device sessions except this current device?")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await revokeAllOtherDevices(user.id, activeDevices[0]?.deviceId || "");
      setMessage({ type: "success", text: `Revoked ${res.sessionsTerminated || 0} active device session(s).` });
      await loadMfaAndDevices();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to revoke other device sessions." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopySecretKey = () => {
    if (setupData?.secretKey) {
      navigator.clipboard.writeText(setupData.secretKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="authority-panel-wrapper">
      {/* Header Banner */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Two-Factor Auth (2FA) & Active Devices</h2>
              <span className={`authority-ver-badge ${mfaStatus?.mfaEnabled ? "bg-emerald-500/20 text-emerald-400" : ""}`}>
                {mfaStatus?.mfaEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
            <p className="authority-subtitle">
              Time-based One-Time Password (TOTP), Backup Emergency Codes & Remote Session Control
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadMfaAndDevices}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Sync Security State
          </button>
        </div>
      </header>

      {/* Message Banner */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertCircle size={18} /> : <ShieldCheck size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* 2FA Status Card & Active Device Card Grid */}
      <div className="authority-content-grid">
        {/* Card 1: 2FA Authentication Config */}
        <div className="authority-card">
          <div className="card-header">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h3>Multi-Factor Authentication</h3>
          </div>

          <div className="card-body">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaStatus?.mfaEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                  <Lock size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Authenticator App (TOTP)</div>
                  <div className="text-xs text-slate-400">Google Authenticator, Authy, or 1Password</div>
                </div>
              </div>

              {mfaStatus?.mfaEnabled ? (
                <button
                  type="button"
                  className="authority-btn authority-btn-danger text-xs"
                  onClick={handleDisableMfa}
                  disabled={actionLoading}
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  className="authority-btn authority-btn-secondary text-xs"
                  onClick={handleInitiateSetup}
                  disabled={actionLoading}
                >
                  Configure 2FA
                </button>
              )}
            </div>

            {/* Setup Form / QR Modal Step */}
            {setupData && !mfaStatus?.mfaEnabled && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Step 1: Scan QR Code or Key</span>
                  <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => setSetupData(null)}>Cancel</button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center text-slate-900 font-bold text-xs text-center border">
                    <QrCode size={100} className="text-slate-900" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <span className="text-xs text-slate-400">Base32 Secret Key:</span>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-sky-300">
                      <span className="truncate">{setupData.secretKey}</span>
                      <button type="button" className="ml-auto hover:text-white" onClick={handleCopySecretKey}>
                        {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emergency Recovery Codes */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Key size={12} /> Emergency Backup Recovery Codes (Save securely):
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                    {setupData.recoveryCodes?.map((code) => (
                      <div key={code} className="text-center">{code}</div>
                    ))}
                  </div>
                </div>

                {/* Confirm step */}
                <form onSubmit={handleVerifySetup} className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Step 2: Enter 6-digit TOTP Code from your app:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                    <button type="submit" className="authority-btn authority-btn-secondary text-xs" disabled={actionLoading}>
                      Confirm & Activate
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Active User Device Sessions */}
        <div className="authority-card">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <Laptop size={18} className="text-sky-500" />
              <h3>Active Device Sessions ({activeDevices.length})</h3>
            </div>

            {activeDevices.length > 1 && (
              <button
                type="button"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                onClick={handleRevokeOtherDevices}
                disabled={actionLoading}
              >
                <LogOut size={12} /> Revoke Others
              </button>
            )}
          </div>

          <div className="card-body">
            {activeDevices.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Info size={20} className="mx-auto mb-2 opacity-50" />
                No active device session details recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeDevices.map((dev, idx) => (
                  <div key={dev.id || dev.deviceId || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                        <Globe size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {dev.deviceName || "Desktop Workstation"}
                          {idx === 0 && <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">Current</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          IP: {dev.ipAddress || "127.0.0.1"} &bull; {dev.location || "San Francisco, US"}
                        </div>
                      </div>
                    </div>

                    {idx > 0 && (
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                        onClick={() => handleRevokeDevice(dev.deviceId)}
                        title="Revoke Device Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
