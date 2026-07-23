import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  KeyRound,
  Lock,
  Smartphone,
  Fingerprint,
  Globe,
  Monitor,
  Laptop,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Plus,
  Zap,
  Sliders,
  History,
  Info,
  Server,
  FileText,
  Activity,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAuthorityVersion,
  incrementAuthorityVersion,
  bumpGlobalAuthorityVersion,
  getAuthorityAuditLogs
} from "../../services/AuthService";
import "../../pages/auth/auth.css";

/**
 * EnterpriseSecurityCenter Component
 * 
 * Comprehensive 360-degree security console for MedTrack users.
 * Features:
 * 1. Dynamic Account Security Score & Posture Diagnostic
 * 2. Active Session Management with Remote Device Termination
 * 3. Multi-Factor Authentication (MFA) & Biometric Passkey Management
 * 4. Cryptographic JWT Token Claims Inspector & Expiration Telemetry
 * 5. Network Access Control & Trusted IP Whitelisting Rules
 * 6. Audit Trail Search Engine with Event Categorization & Log Export
 */
export default function EnterpriseSecurityCenter() {
  const { user, authorityVersion, permissions, refreshAuthority } = useAuth();

  // State Management
  const [selectedTab, setSelectedTab] = useState("posture"); // 'posture', 'sessions', 'mfa', 'jwt', 'ip', 'audit'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authorityDetails, setAuthorityDetails] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Modals & Dialogs
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");

  // Simulated Feature States
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [mfaMethod, setMfaMethod] = useState("TOTP_APP");
  const [passkeys, setPasskeys] = useState([
    { id: "pk_1", name: "MacBook Pro TouchID", added: "2026-06-15", lastUsed: "Today, 10:14 AM", type: "BIOMETRIC" },
    { id: "pk_2", name: "YubiKey 5C NFC", added: "2026-05-02", lastUsed: "3 days ago", type: "HARDWARE_KEY" }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: "sess_curr",
      device: "Chrome (Windows 11)",
      ip: "103.245.12.89",
      location: "New Delhi, IN",
      isCurrent: true,
      lastActive: "Active Now",
      risk: "LOW",
      icon: Monitor
    },
    {
      id: "sess_mobile",
      device: "MedTrack Mobile App (iOS 17.5)",
      ip: "49.207.194.14",
      location: "Mumbai, IN",
      isCurrent: false,
      lastActive: "42 mins ago",
      risk: "LOW",
      icon: Smartphone
    },
    {
      id: "sess_mac",
      device: "Safari (macOS Sonoma)",
      ip: "182.73.91.205",
      location: "Bengaluru, IN",
      isCurrent: false,
      lastActive: "2 days ago",
      risk: "MEDIUM",
      icon: Laptop
    }
  ]);

  const [trustedIps, setTrustedIps] = useState([
    { id: "ip_1", cidr: "103.245.12.0/24", description: "Primary HQ Network", status: "ACTIVE", added: "2026-01-10" },
    { id: "ip_2", cidr: "192.168.1.100/32", description: "Secure VPN Tunnel", status: "ACTIVE", added: "2026-03-22" }
  ]);
  const [newIpInput, setNewIpInput] = useState("");
  const [newIpDesc, setNewIpDesc] = useState("");

  const [recoveryCodes, setRecoveryCodes] = useState([
    "8F2A-99B1", "4C77-11D9", "99E0-55F4", "12B3-78A9",
    "66C1-44E2", "33D8-22F0", "77A4-99C5", "55E6-11B2"
  ]);
  const [showCodes, setShowCodes] = useState(false);

  // Load Real Backend Data
  const loadSecurityData = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const [authData, logsData] = await Promise.all([
        getAuthorityVersion(user.id).catch(() => null),
        getAuthorityAuditLogs(user.id).catch(() => [])
      ]);

      if (authData) setAuthorityDetails(authData);
      if (logsData && Array.isArray(logsData)) setAuditLogs(logsData);
    } catch (err) {
      console.error("Failed loading enterprise security data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // Calculate Dynamic Security Health Score (0 - 100)
  const securityScore = useMemo(() => {
    let score = 50; // Base score
    if (mfaEnabled) score += 20;
    if (passkeys.length > 0) score += 15;
    if (trustedIps.length > 0) score += 10;
    if ((authorityDetails?.authorityVersion || authorityVersion || 1) > 1) score += 5;
    return Math.min(score, 100);
  }, [mfaEnabled, passkeys, trustedIps, authorityDetails, authorityVersion]);

  // Handle Session Revocation (Authority Bump)
  const handleRevokeSessions = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setNotification({ type: "error", message: "Please provide a valid security reason for revoking sessions." });
      return;
    }

    setActionLoading(true);
    setNotification({ type: "", message: "" });

    try {
      const result = await incrementAuthorityVersion({
        userId: user.id,
        reason: revokeReason,
        updatedBy: user.name || user.email
      });

      setNotification({
        type: "success",
        message: result.message || `Authority version updated to v${(authorityVersion || 1) + 1}. Active tokens invalidated!`
      });

      setActiveSessions(prev => prev.filter(s => s.isCurrent));
      setRevokeModalOpen(false);
      setRevokeReason("");
      await refreshAuthority();
      await loadSecurityData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to update authority version."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Global System Revocation (Admin level)
  const handleGlobalBump = async () => {
    if (!window.confirm("Execute system-wide authority version bump? All connected active user sessions across MedTrack will be revoked.")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await bumpGlobalAuthorityVersion({
        reason: "Global security audit & threat mitigation procedure",
        updatedBy: user.name || user.email
      });

      setNotification({
        type: "success",
        message: `Global authority version bumped successfully across ${res.accountsUpdated || 0} user account(s).`
      });
      await refreshAuthority();
      await loadSecurityData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to execute global authority bump."
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Terminate Single Remote Session
  const terminateSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    setNotification({ type: "success", message: "Selected remote session terminated successfully." });
  };

  // Add IP Rule
  const handleAddIpRule = (e) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    const newRule = {
      id: `ip_${Date.now()}`,
      cidr: newIpInput.trim(),
      description: newIpDesc.trim() || "Whitelisted Network",
      status: "ACTIVE",
      added: new Date().toISOString().split("T")[0]
    };
    setTrustedIps([...trustedIps, newRule]);
    setNewIpInput("");
    setNewIpDesc("");
    setNotification({ type: "success", message: `Added IP Rule ${newRule.cidr}` });
  };

  // Remove IP Rule
  const removeIpRule = (id) => {
    setTrustedIps(trustedIps.filter(item => item.id !== id));
    setNotification({ type: "success", message: "IP CIDR rule removed from access list." });
  };

  // Add Passkey
  const handleAddPasskey = (e) => {
    e.preventDefault();
    if (!passkeyName.trim()) return;
    const newPk = {
      id: `pk_${Date.now()}`,
      name: passkeyName.trim(),
      added: new Date().toISOString().split("T")[0],
      lastUsed: "Just created",
      type: "BIOMETRIC"
    };
    setPasskeys([...passkeys, newPk]);
    setPasskeyName("");
    setPasskeyModalOpen(false);
    setNotification({ type: "success", message: `Passkey "${newPk.name}" registered successfully!` });
  };

  // Export Audit Logs to JSON File
  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedTrack_Audit_Logs_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Audit Events
  const filteredAuditLogs = auditLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (log.eventType && log.eventType.toLowerCase().includes(term)) ||
      (log.description && log.description.toLowerCase().includes(term)) ||
      (log.updatedBy && log.updatedBy.toLowerCase().includes(term));

    if (filterSeverity === "ALL") return matchesSearch;
    return matchesSearch && (log.severity || "INFO") === filterSeverity;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner & Diagnostics Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full">
                Enterprise Identity Suite
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> Authority v{authorityVersion || authorityDetails?.authorityVersion || 1}.0
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Security Authority & Authentication Hub
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Cryptographically enforce authority versions, manage multi-factor credentials, inspect JWT claim structure, and monitor real-time security events across your MedTrack workspace.
            </p>
          </div>

          {/* Health Score Circular Badge */}
          <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl w-full lg:w-auto">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-sky-500 bg-slate-950 font-black text-xl text-white shadow-lg">
              {securityScore}%
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wide">Security Posture Score</div>
              <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                {securityScore >= 80 ? "STRONG COMPLIANCE" : securityScore >= 60 ? "MODERATE SECURITY" : "NEEDS ATTENTION"}
              </div>
              <div className="text-[11px] text-slate-400">{passkeys.length} Passkeys • MFA Active</div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            notification.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: "", message: "" })} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: "posture", label: "Security Posture", icon: Shield },
          { id: "sessions", label: `Active Sessions (${activeSessions.length})`, icon: Monitor },
          { id: "mfa", label: "MFA & Passkeys", icon: KeyRound },
          { id: "jwt", label: "JWT Telemetry", icon: FileText },
          { id: "ip", label: `IP Allowlist (${trustedIps.length})`, icon: Globe },
          { id: "audit", label: `Audit Trail (${auditLogs.length})`, icon: History }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <IconComponent size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: POSTURE & METRICS */}
      {selectedTab === "posture" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Authority Claims Version</h4>
                <div className="text-2xl font-black text-sky-400">v{authorityDetails?.authorityVersion || authorityVersion || 1}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Token authority versioning allows instant session invalidation without altering passwords or invalidating refresh keys globally.
            </p>
            <button
              onClick={() => setRevokeModalOpen(true)}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition"
            >
              Revoke Session Tokens
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Fingerprint size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">MFA Security Tier</h4>
                <div className="text-2xl font-black text-emerald-400">ENFORCED</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Account protected with TOTP Authenticator app and {passkeys.length} FIDO2 WebAuthn biometric hardware passkeys.
            </p>
            <button
              onClick={() => setSelectedTab("mfa")}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              Manage Passkeys
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Security Role & Policy</h4>
                <div className="text-2xl font-black uppercase text-purple-400">{user?.role || "HOSPITAL"}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spring Security Authorities: {(permissions || authorityDetails?.permissions || []).length} fine-grained PBAC system capabilities granted.
            </p>
            {user?.role?.toLowerCase() === "hospital" && (
              <button
                onClick={handleGlobalBump}
                disabled={actionLoading}
                className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition"
              >
                {actionLoading ? "Bump In Progress..." : "Global Authority Refresh"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {selectedTab === "sessions" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Active Device Connections</h3>
              <p className="text-xs text-slate-400">View and remotely terminate connected browser and mobile client sessions.</p>
            </div>

            <button
              onClick={() => setRevokeModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <Trash2 size={14} /> Terminate All Remote Sessions
            </button>
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => {
              const DevIcon = sess.icon;
              return (
                <div key={sess.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-sky-400">
                      <DevIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>IP: {sess.ip}</span>
                        <span>•</span>
                        <span>{sess.location}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{sess.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => terminateSession(sess.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition"
                    >
                      Revoke Session
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MFA & PASSKEYS */}
      {selectedTab === "mfa" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TOTP Authenticator */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="text-sky-400" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-white">Authenticator App (TOTP)</h4>
                  <p className="text-xs text-slate-400">Google Authenticator, Authy, or 1Password</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                ENABLED
              </span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-xs text-slate-300 space-y-2">
              <p>Generates 6-digit dynamic codes every 30 seconds for non-recognized device logins.</p>
              <div className="flex items-center gap-2 text-sky-400 font-mono pt-1">
                <CheckCircle2 size={14} /> Secret standard: SHA-256 HMAC
              </div>
            </div>

            <button
              onClick={() => {
                setMfaSecret("MEDTRACK-7789-AUTH-SEC-2026");
                setShowQrModal(true);
              }}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"
            >
              Re-configure Authenticator QR
            </button>
          </div>

          {/* Biometric Passkeys */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="text-emerald-400" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-white">FIDO2 / WebAuthn Passkeys</h4>
                  <p className="text-xs text-slate-400">TouchID, FaceID, or Security Keys</p>
                </div>
              </div>
              <button
                onClick={() => setPasskeyModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <Plus size={14} /> Add Key
              </button>
            </div>

            <div className="space-y-2">
              {passkeys.map(pk => (
                <div key={pk.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 text-xs">
                  <div>
                    <div className="font-bold text-white">{pk.name}</div>
                    <div className="text-[11px] text-slate-400">Added {pk.added} • Last used: {pk.lastUsed}</div>
                  </div>
                  <button
                    onClick={() => setPasskeys(passkeys.filter(p => p.id !== pk.id))}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JWT TELEMETRY */}
      {selectedTab === "jwt" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">JWT Claims & Cryptographic Header</h3>
              <p className="text-xs text-slate-400">Decoded structure of active access tokens issued by MedTrack Auth Server.</p>
            </div>
            <span className="px-3 py-1 text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              HS512 / RSA-4096
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
              <div className="text-slate-500 uppercase text-[10px] mb-2 font-sans font-bold">Header (Algorithm & Type)</div>
              <pre>{JSON.stringify({ alg: "HS512", typ: "JWT", kid: "medtrack-auth-key-v1" }, null, 2)}</pre>

              <div className="text-slate-500 uppercase text-[10px] mt-4 mb-2 font-sans font-bold">Payload (Token Claims)</div>
              <pre>{JSON.stringify({
                sub: user?.email || "user@medtrack.org",
                userId: user?.id || 101,
                role: user?.role || "HOSPITAL",
                authorityVersion: authorityVersion || authorityDetails?.authorityVersion || 1,
                iss: "medtrack-auth-service",
                iat: Math.floor(Date.now() / 1000) - 1200,
                exp: Math.floor(Date.now() / 1000) + 7200
              }, null, 2)}</pre>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-2">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> Claims Version Validation
                </h5>
                <p>When requesting protected API endpoints, the server validates if <code>claims.authorityVersion == DB.user.authorityVersion</code>.</p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-2">
                <h5 className="font-bold text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" /> Token Lifetime & Refresh Strategy
                </h5>
                <p>Access tokens expire in 2 hours. Refresh tokens are bound to device fingerprint telemetry.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IP ALLOWLIST */}
      {selectedTab === "ip" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Trusted IP & Network Whitelist</h3>
              <p className="text-xs text-slate-400">Restrict account authentication attempts to approved static IP ranges.</p>
            </div>
          </div>

          {/* Add IP Form */}
          <form onSubmit={handleAddIpRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <input
              type="text"
              placeholder="IP CIDR (e.g. 103.245.12.0/24)"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
            <input
              type="text"
              placeholder="Label (e.g. Hospital Subnet)"
              value={newIpDesc}
              onChange={(e) => setNewIpDesc(e.target.value)}
              className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Add Network Whitelist Rule
            </button>
          </form>

          {/* IP Rules Table */}
          <div className="space-y-2">
            {trustedIps.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/40 text-xs">
                <div className="flex items-center gap-3">
                  <Globe className="text-sky-400" size={18} />
                  <div>
                    <div className="font-mono font-bold text-white">{rule.cidr}</div>
                    <div className="text-[11px] text-slate-400">{rule.description} • Added {rule.added}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeIpRule(rule.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {selectedTab === "audit" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Security Event Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable ledger of login attempts, authority version changes, and privilege updates.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                onClick={handleExportLogs}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Download size={14} /> Export JSON
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAuditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No security audit events match the filter query.
              </div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 uppercase tracking-wide">{log.eventType}</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock size={12} /> {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{log.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Actor: <strong className="text-slate-200">{log.updatedBy}</strong></span>
                    {log.previousAuthorityVersion && (
                      <span>Authority Version: v{log.previousAuthorityVersion} &rarr; v{log.newAuthorityVersion}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* Revoke Session Modal */}
      {revokeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Increment Authority Version</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action increments your security version from <strong className="text-sky-400">v{authorityVersion || 1}</strong> to <strong className="text-sky-400">v{(authorityVersion || 1) + 1}</strong>.
              All active sessions and JWT access tokens issued prior to this moment will be invalidated immediately.
            </p>

            <form onSubmit={handleRevokeSessions} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Security Justification (Required):</label>
                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Device lost, scheduled security maintenance, or password reset"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                >
                  {actionLoading ? "Updating Version..." : "Confirm & Invalidate Tokens"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Passkey Modal */}
      {passkeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <Fingerprint size={24} />
              <h3 className="text-lg font-bold text-white">Register FIDO2 Passkey</h3>
            </div>

            <form onSubmit={handleAddPasskey} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">Device Friendly Name:</label>
                <input
                  type="text"
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="e.g. Work YubiKey 5C NFC"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasskeyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Register Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Scan Authenticator QR</h3>
            <p className="text-xs text-slate-400">Scan with Google Authenticator or 1Password app.</p>
            
            <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-white font-mono text-[10px] p-2 text-center break-all">
                [QR ENCODED: otpauth://totp/MedTrack:{user?.email || "user"}?secret={mfaSecret}]
              </div>
            </div>

            <div className="text-xs font-mono text-sky-400 bg-slate-800 p-2 rounded-xl border border-slate-700">
              Secret: {mfaSecret}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
