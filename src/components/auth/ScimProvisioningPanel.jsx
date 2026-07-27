import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserX,
  PlusCircle,
  History,
  Shield,
  Sliders,
  Layers
} from "lucide-react";
import {
  getActivePolicy,
  updatePolicy,
  provisionScimUser,
  deprovisionScimUser,
  getAllUserMappings,
  getAllAuditLogs
} from "../../services/ScimProvisioningService";
import "../../pages/auth/auth.css";

export default function ScimProvisioningPanel() {
  const [policy, setPolicy] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Policy Form State
  const [primaryIdpProvider, setPrimaryIdpProvider] = useState("OKTA");
  const [deprovisionAction, setDeprovisionAction] = useState("SUSPEND");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [enforceRoleMapping, setEnforceRoleMapping] = useState(true);

  // New SCIM User Form State
  const [scimExternalId, setScimExternalId] = useState("");
  const [medtrackUsername, setMedtrackUsername] = useState("");
  const [email, setEmail] = useState("");
  const [enterpriseIdpProvider, setEnterpriseIdpProvider] = useState("OKTA");
  const [assignedRole, setAssignedRole] = useState("HOSPITAL_ADMIN");

  const loadScimData = useCallback(async () => {
    setLoading(true);
    try {
      const [pol, userList, logList] = await Promise.all([
        getActivePolicy().catch(() => null),
        getAllUserMappings().catch(() => []),
        getAllAuditLogs().catch(() => [])
      ]);

      if (pol) {
        setPolicy(pol);
        setPrimaryIdpProvider(pol.primaryIdpProvider || "OKTA");
        setDeprovisionAction(pol.defaultDeprovisionAction || "SUSPEND");
        setAutoSyncEnabled(pol.autoSyncEnabled);
        setEnforceRoleMapping(pol.enforceRoleMapping);
      }

      setUsers(userList);
      setAuditLogs(logList);
    } catch (err) {
      console.error("Failed to load SCIM provisioning data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScimData();
  }, [loadScimData]);

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await updatePolicy({
        policyName: "MASTER_SCIM_POLICY",
        primaryIdpProvider,
        defaultDeprovisionAction: deprovisionAction,
        autoSyncEnabled,
        enforceRoleMapping
      });

      setPolicy(updated);
      setMessage({ type: "success", text: "SCIM 2.0 provisioning policy updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update policy." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!scimExternalId.trim() || !medtrackUsername.trim() || !email.trim()) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const provisioned = await provisionScimUser({
        scimExternalId: scimExternalId.trim(),
        medtrackUsername: medtrackUsername.trim(),
        email: email.trim(),
        enterpriseIdpProvider,
        assignedRole
      });

      setScimExternalId("");
      setMedtrackUsername("");
      setEmail("");
      setMessage({ type: "success", text: `Provisioned identity for ${provisioned.medtrackUsername}` });
      await loadScimData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to provision SCIM user." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeprovisionUser = async (extId) => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await deprovisionScimUser({
        scimExternalId: extId,
        deprovisionReason: "Manual deprovisioning requested by operator"
      });

      setMessage({ type: "success", text: `User ${updated.medtrackUsername} set to ${updated.syncStatus}` });
      await loadScimData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to deprovision user." });
    } finally {
      setActionLoading(false);
    }
  };

  const activeUsers = users.filter((u) => u.syncStatus === "PROVISIONED");
  const suspendedUsers = users.filter((u) => u.syncStatus !== "PROVISIONED");

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-blue-500/20 text-blue-400">
            <Users size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">SCIM 2.0 Identity Provisioning & Federation</h2>
              <span className="authority-ver-badge bg-blue-500/20 text-blue-300">
                FEDERATED USERS: {activeUsers.length} ACTIVE ({suspendedUsers.length} DEPROVISIONED)
              </span>
            </div>
            <p className="authority-subtitle">
              Automated Okta, Azure AD, and PingIdentity cross-domain user provisioning and role-mapping lifecycle
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadScimData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Directory
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
        {/* Left Column: User Provisioning Simulator & SCIM Policy Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Provisioning Form Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-blue-400" />
                <h3>Provision Enterprise User</h3>
              </div>
            </div>

            <form onSubmit={handleProvisionUser} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">IdP External User ID:</label>
                <input
                  type="text"
                  placeholder="e.g. okta-usr-9910"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={scimExternalId}
                  onChange={(e) => setScimExternalId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">MedTrack Username:</label>
                <input
                  type="text"
                  placeholder="e.g. sarah.connor"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={medtrackUsername}
                  onChange={(e) => setMedtrackUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address:</label>
                <input
                  type="email"
                  placeholder="sarah@medtrack.org"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IdP Provider:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={enterpriseIdpProvider}
                    onChange={(e) => setEnterpriseIdpProvider(e.target.value)}
                  >
                    <option value="OKTA">OKTA</option>
                    <option value="AZURE_AD">AZURE AD</option>
                    <option value="PING_IDENTITY">PING IDENTITY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role:</label>
                  <select
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value)}
                  >
                    <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-primary w-full bg-blue-600 hover:bg-blue-500 text-white text-xs mt-2"
                disabled={actionLoading}
              >
                Provision SCIM Identity
              </button>
            </form>
          </div>

          {/* Policy Settings Card */}
          <div className="authority-card">
            <div className="card-header justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-blue-400" />
                <h3>SCIM 2.0 Policy Rules</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePolicy} className="card-body space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Enterprise IdP:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={primaryIdpProvider}
                  onChange={(e) => setPrimaryIdpProvider(e.target.value)}
                >
                  <option value="OKTA">OKTA IDENTITY ENGINE</option>
                  <option value="AZURE_AD">MICROSOFT ENTRA / AZURE AD</option>
                  <option value="PING_IDENTITY">PING IDENTITY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Deprovisioning Action:</label>
                <select
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={deprovisionAction}
                  onChange={(e) => setDeprovisionAction(e.target.value)}
                >
                  <option value="SUSPEND">SUSPEND ACCOUNT</option>
                  <option value="SOFT_DELETE">SOFT DELETE</option>
                  <option value="ANONYMIZE">ANONYMIZE PII</option>
                </select>
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Automated SCIM Directory Sync</span>
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer">
                  <span className="text-slate-300 font-semibold">Enforce IdP Group Role Mapping</span>
                  <input
                    type="checkbox"
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
                    checked={enforceRoleMapping}
                    onChange={(e) => setEnforceRoleMapping(e.target.checked)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="authority-btn authority-btn-secondary w-full text-xs mt-2"
                disabled={actionLoading}
              >
                Save SCIM Rules
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Mapped SCIM Users & Provisioning Audit Trail */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {/* Mapped Users Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck size={18} className="text-blue-400" /> Mapped Enterprise IdP Identities ({users.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">External IdP ID</th>
                    <th className="p-3">User & Email</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-blue-300">{u.scimExternalId}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-white">{u.medtrackUsername}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-3 text-slate-300 text-[10px]">{u.enterpriseIdpProvider}</td>
                      <td className="p-3 text-amber-300 font-semibold text-[10px]">{u.assignedRole}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.syncStatus === "PROVISIONED" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"}`}>
                          {u.syncStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {u.syncStatus === "PROVISIONED" && (
                          <button
                            type="button"
                            className="text-[10px] px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded"
                            onClick={() => handleDeprovisionUser(u.scimExternalId)}
                          >
                            Deprovision
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                        No SCIM federated users provisioned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provisioning Audit Logs */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={18} className="text-cyan-400" /> SCIM Provisioning Audit Trail ({auditLogs.length})
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/30">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">External ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Executed By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Executed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 text-[11px]">
                      <td className="p-3 font-bold text-white">{log.scimExternalId}</td>
                      <td className="p-3 font-semibold text-blue-300">{log.actionType}</td>
                      <td className="p-3 text-slate-300">{log.executedBy}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">
                        {log.executedAt ? new Date(log.executedAt).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        No provisioning audit events recorded yet.
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
