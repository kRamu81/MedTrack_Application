import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  KeyRound,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserCheck,
  Zap,
  Activity,
  Search,
  Sliders,
  History,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAuthorityVersion,
  incrementAuthorityVersion,
  bumpGlobalAuthorityVersion,
  getAuthorityAuditLogs
} from "../../services/AuthService";
import "../../pages/auth/auth.css";

export default function AuthoritySecurityPanel() {
  const { user, authorityVersion, permissions, refreshAuthority } = useAuth();
  
  const [authorityDetails, setAuthorityDetails] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview"); // 'overview', 'permissions', 'audit'
  const [message, setMessage] = useState({ type: "", text: "" });
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const loadSecurityData = useCallback(async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      const [authData, logsData] = await Promise.all([
        getAuthorityVersion(user.id).catch(() => null),
        getAuthorityAuditLogs(user.id).catch(() => [])
      ]);

      if (authData) {
        setAuthorityDetails(authData);
      }
      if (logsData) {
        setAuditLogs(logsData);
      }
    } catch (err) {
      console.error("Failed to load security authority data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  const handleIncrementVersion = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setMessage({ type: "error", text: "Please state a security justification for invalidating sessions." });
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await incrementAuthorityVersion({
        userId: user.id,
        reason: revokeReason,
        updatedBy: user.name || user.email
      });

      setMessage({ type: "success", text: result.message || "Authority version incremented successfully! Prior sessions revoked." });
      setRevokeModalOpen(false);
      setRevokeReason("");
      await refreshAuthority();
      await loadSecurityData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update authority version." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGlobalBump = async () => {
    if (!window.confirm("Are you sure you want to perform a global authority version bump? This will force all active system users to re-authenticate.")) {
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await bumpGlobalAuthorityVersion({
        reason: "Global security authority refresh initiated from workspace",
        updatedBy: user.name || user.email
      });

      setMessage({ type: "success", text: `Global authority version bumped across ${res.accountsUpdated || 0} account(s).` });
      await refreshAuthority();
      await loadSecurityData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to execute global authority bump." });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.eventType && log.eventType.toLowerCase().includes(term)) ||
      (log.description && log.description.toLowerCase().includes(term)) ||
      (log.updatedBy && log.updatedBy.toLowerCase().includes(term))
    );
  });

  return (
    <div className="authority-panel-wrapper">
      {/* Header Banner */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge">
            <Shield size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Security Authority & Privilege Center</h2>
              <span className="authority-ver-badge">v{authorityVersion || authorityDetails?.authorityVersion || 1}.0</span>
            </div>
            <p className="authority-subtitle">
              Enterprise Access Control, Session Revocation, and Cryptographic Security Auditing
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadSecurityData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Authority State
          </button>
          
          <button
            type="button"
            className="authority-btn authority-btn-danger"
            onClick={() => setRevokeModalOpen(true)}
          >
            <KeyRound size={16} />
            Revoke All Active Sessions
          </button>
        </div>
      </header>

      {/* Message Notifications */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>Dismiss</button>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="authority-stats-grid">
        <div className="authority-stat-card">
          <div className="stat-icon-wrapper blue">
            <Lock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Authority Version</span>
            <span className="stat-value">v{authorityDetails?.authorityVersion || authorityVersion || 1}</span>
            <span className="stat-hint">Cryptographically signed in JWT claims</span>
          </div>
        </div>

        <div className="authority-stat-card">
          <div className="stat-icon-wrapper green">
            <UserCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Assigned Role</span>
            <span className="stat-value uppercase">{user?.role || authorityDetails?.role || "HOSPITAL"}</span>
            <span className="stat-hint">Mapped to Spring Security authorities</span>
          </div>
        </div>

        <div className="authority-stat-card">
          <div className="stat-icon-wrapper purple">
            <Zap size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Granted Permissions</span>
            <span className="stat-value">{(authorityDetails?.permissions || permissions || []).length} Active</span>
            <span className="stat-hint">Fine-grained PBAC system capabilities</span>
          </div>
        </div>

        <div className="authority-stat-card">
          <div className="stat-icon-wrapper amber">
            <Activity size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Audit Log Count</span>
            <span className="stat-value">{auditLogs.length} Events</span>
            <span className="stat-hint">Immutable security event history</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="authority-tabs">
        <button
          type="button"
          className={`authority-tab ${selectedTab === "overview" ? "active" : ""}`}
          onClick={() => setSelectedTab("overview")}
        >
          <Shield size={16} />
          Authority Overview
        </button>

        <button
          type="button"
          className={`authority-tab ${selectedTab === "permissions" ? "active" : ""}`}
          onClick={() => setSelectedTab("permissions")}
        >
          <Sliders size={16} />
          Role Permissions ({ (authorityDetails?.permissions || permissions || []).length })
        </button>

        <button
          type="button"
          className={`authority-tab ${selectedTab === "audit" ? "active" : ""}`}
          onClick={() => setSelectedTab("audit")}
        >
          <History size={16} />
          Security Audit Logs ({ auditLogs.length })
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {selectedTab === "overview" && (
        <div className="authority-content-grid">
          {/* Card: Active User Authority Context */}
          <div className="authority-card">
            <div className="card-header">
              <KeyRound size={18} className="text-sky-500" />
              <h3>User Authority Context</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <span className="detail-key">Account Identity:</span>
                <span className="detail-val font-semibold">{user?.name} ({user?.email})</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Organization:</span>
                <span className="detail-val">{user?.organization || "MedTrack Network"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Role Classification:</span>
                <span className="badge-role">{user?.role?.toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Authority Version:</span>
                <span className="badge-version">v{authorityDetails?.authorityVersion || authorityVersion || 1}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Account Status:</span>
                <span className="badge-status-active">
                  <CheckCircle2 size={12} /> ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Card: Instant Session Revocation & Administrative Actions */}
          <div className="authority-card">
            <div className="card-header">
              <Lock size={18} className="text-amber-500" />
              <h3>Security Actions & Revocation</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Incrementing the <strong>Authority Version</strong> forces an instant cryptographic invalidation of all existing JWT access tokens generated prior to this moment.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="authority-btn authority-btn-danger w-full justify-center"
                  onClick={() => setRevokeModalOpen(true)}
                >
                  <KeyRound size={16} />
                  Increment Authority Version (Revoke Sessions)
                </button>

                {user?.role?.toLowerCase() === "hospital" && (
                  <button
                    type="button"
                    className="authority-btn authority-btn-warning w-full justify-center"
                    onClick={handleGlobalBump}
                    disabled={actionLoading}
                  >
                    <Zap size={16} />
                    Bump System-Wide Global Authority Version
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS */}
      {selectedTab === "permissions" && (
        <div className="authority-card">
          <div className="card-header">
            <Sliders size={18} className="text-emerald-500" />
            <h3>Assigned Fine-Grained Permissions</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Permissions are granted based on your registered security role (<strong>{user?.role?.toUpperCase()}</strong>). They dictate allowable read, write, and execute capabilities in MedTrack.
            </p>

            <div className="permissions-grid">
              {(authorityDetails?.permissions || permissions || []).map((perm) => (
                <div key={perm} className="permission-chip">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="font-mono text-xs font-semibold">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {selectedTab === "audit" && (
        <div className="authority-card">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <History size={18} className="text-purple-500" />
              <h3>Security Audit Trail Log</h3>
            </div>

            <div className="search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Filter audit events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Info size={24} className="mx-auto mb-2 opacity-50" />
                No authority audit logs match your filter query.
              </div>
            ) : (
              <div className="audit-timeline">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-bullet" />
                    <div className="audit-main">
                      <div className="audit-meta">
                        <span className="audit-event-type">{log.eventType}</span>
                        <span className="audit-time">
                          <Clock size={12} /> {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
                        </span>
                      </div>
                      <p className="audit-desc">{log.description}</p>
                      <div className="audit-footer">
                        <span>Actor: <strong>{log.updatedBy}</strong></span>
                        {log.previousAuthorityVersion && (
                          <span>Version: v{log.previousAuthorityVersion} &rarr; v{log.newAuthorityVersion}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SESSION REVOCATION MODAL */}
      {revokeModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <AlertTriangle className="text-amber-500" size={24} />
              <h3>Confirm Authority Version Increment</h3>
            </div>
            
            <form onSubmit={handleIncrementVersion}>
              <div className="modal-body">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  This action will increment your security <strong>Authority Version</strong> from 
                  <span className="font-bold"> v{authorityVersion || 1}</span> to 
                  <span className="font-bold text-sky-500"> v{(authorityVersion || 1) + 1}</span>.
                  All currently active sessions and JWT tokens issued for this account will be invalidated immediately.
                </p>

                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Justification / Reason (Required):
                </label>
                <textarea
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={3}
                  placeholder="e.g. Lost device, routine key rotation, or suspected compromised session"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="authority-btn authority-btn-secondary"
                  onClick={() => setRevokeModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="authority-btn authority-btn-danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating Version..." : "Confirm & Invalidate Sessions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
