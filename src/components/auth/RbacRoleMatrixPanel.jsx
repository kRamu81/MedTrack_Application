import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Lock,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  CheckSquare,
  Square,
  Key,
  Users,
  Search,
  Zap,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllRoles,
  getAllPermissions,
  createRole,
  updateRolePermissions,
  checkUserPermission
} from "../../services/RbacSecurityService";
import "../../pages/auth/auth.css";

export default function RbacRoleMatrixPanel() {
  const { user } = useAuth();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activePermissions, setActivePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New role state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  // Test permission check
  const [testPermCode, setTestPermCode] = useState("EQUIPMENT:READ");
  const [testResult, setTestResult] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadRbacData = useCallback(async () => {
    setLoading(true);
    try {
      const [roleList, permList] = await Promise.all([
        getAllRoles().catch(() => []),
        getAllPermissions().catch(() => [])
      ]);

      setRoles(roleList);
      setPermissions(permList);

      if (roleList.length > 0 && !selectedRole) {
        setSelectedRole(roleList[0]);
        setActivePermissions(roleList[0].grantedPermissionCodes || []);
      }
    } catch (err) {
      console.error("Failed to load RBAC Matrix:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadRbacData();
  }, [loadRbacData]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setActivePermissions(role.grantedPermissionCodes || []);
    setTestResult(null);
  };

  const handleTogglePermission = (code) => {
    if (!selectedRole) return;
    if (activePermissions.includes(code)) {
      setActivePermissions(activePermissions.filter((c) => c !== code));
    } else {
      setActivePermissions([...activePermissions, code]);
    }
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedRole = await updateRolePermissions(selectedRole.id, activePermissions);
      setMessage({ type: "success", text: `Permission policy matrix updated for ${selectedRole.roleName}` });

      setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
      setSelectedRole(updatedRole);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update permission matrix." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setMessage({ type: "error", text: "Role name is required." });
      return;
    }

    setActionLoading(true);
    try {
      const created = await createRole({
        roleName: newRoleName.trim(),
        description: newRoleDescription.trim()
      });

      setMessage({ type: "success", text: `Role ${created.roleName} onboarded successfully!` });
      setShowCreateModal(false);
      setNewRoleName("");
      setNewRoleDescription("");
      await loadRbacData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create role." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvaluatePermission = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setMessage({ type: "error", text: "Authenticated user context missing." });
      return;
    }

    setActionLoading(true);
    try {
      const res = await checkUserPermission(user.id, testPermCode);
      setTestResult(res);
    } catch (err) {
      setMessage({ type: "error", text: "Permission check failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Group permissions by resource category
  const categories = Array.from(new Set(permissions.map((p) => p.resourceCategory)));

  return (
    <div className="authority-panel-wrapper">
      {/* Header Card */}
      <header className="authority-header-card">
        <div className="authority-header-main">
          <div className="authority-icon-badge bg-emerald-500/20 text-emerald-400">
            <Lock size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="authority-title">Role-Based Access Control (RBAC) & Policy Matrix</h2>
              <span className="authority-ver-badge bg-emerald-500/20 text-emerald-300">
                FINE-GRAINED SECURITY
              </span>
            </div>
            <p className="authority-subtitle">
              Manage system roles, configure granular resource permissions, and evaluate real-time authorization rights
            </p>
          </div>
        </div>

        <div className="authority-header-actions">
          <button
            type="button"
            className="authority-btn authority-btn-primary bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={16} /> Create Custom Role
          </button>
          <button
            type="button"
            className="authority-btn authority-btn-secondary"
            onClick={loadRbacData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Sync Matrix
          </button>
        </div>
      </header>

      {/* Message Alert */}
      {message.text && (
        <div className={`authority-alert ${message.type === "error" ? "authority-alert-error" : "authority-alert-success"}`}>
          {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={() => setMessage({ type: "", text: "" })}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Role Selection List */}
        <div className="authority-card lg:col-span-1">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-emerald-400" />
              <h3>System Roles ({roles.length})</h3>
            </div>
          </div>

          <div className="card-body space-y-2">
            {roles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleSelect(r)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition border ${isSelected ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg" : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{r.roleName}</span>
                    {r.systemRole && (
                      <span className="text-[10px] bg-slate-700 text-emerald-300 px-2 py-0.5 rounded-full">
                        SYSTEM
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {r.description || "No description provided"}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-2 font-mono">
                    Permissions: {r.grantedPermissionCodes?.length || 0} granted
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Matrix Area */}
        <div className="authority-card lg:col-span-2 space-y-6">
          {selectedRole ? (
            <>
              <div className="card-header justify-between">
                <div>
                  <h3 className="text-white text-base font-bold flex items-center gap-2">
                    <Sliders size={18} className="text-emerald-400" />
                    Permission Matrix for: <span className="text-emerald-400">{selectedRole.roleName}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Toggle checkmarks to grant or revoke specific operation rights.</p>
                </div>

                <button
                  type="button"
                  className="authority-btn authority-btn-primary bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  onClick={handleSaveMatrix}
                  disabled={actionLoading}
                >
                  Save Policy Matrix
                </button>
              </div>

              <div className="card-body space-y-6">
                {categories.map((cat) => {
                  const catPerms = permissions.filter((p) => p.resourceCategory === cat);
                  return (
                    <div key={cat} className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                        <Key size={14} /> {cat} OPERATIONS ({catPerms.length})
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {catPerms.map((p) => {
                          const isChecked = activePermissions.includes(p.permissionCode);
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleTogglePermission(p.permissionCode)}
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition border ${isChecked ? "bg-emerald-950/30 border-emerald-500/50 text-white" : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-slate-200"}`}
                            >
                              <div className="mt-0.5">
                                {isChecked ? <CheckSquare size={18} className="text-emerald-400" /> : <Square size={18} className="text-slate-500" />}
                              </div>
                              <div>
                                <div className="font-mono text-xs font-bold text-slate-200">{p.permissionCode}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Real-time Permission Check Sandbox */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" /> Real-Time Access Right Evaluator Sandbox
                  </h4>

                  <form onSubmit={handleEvaluatePermission} className="flex gap-2">
                    <select
                      className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      value={testPermCode}
                      onChange={(e) => setTestPermCode(e.target.value)}
                    >
                      {permissions.map((p) => (
                        <option key={p.id} value={p.permissionCode}>
                          {p.permissionCode} - {p.description}
                        </option>
                      ))}
                    </select>

                    <button type="submit" className="authority-btn authority-btn-secondary text-xs" disabled={actionLoading}>
                      Evaluate Rights
                    </button>
                  </form>

                  {testResult && (
                    <div className={`p-3 rounded-xl text-xs border flex items-center justify-between ${testResult.granted ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : "bg-red-950/40 border-red-500/30 text-red-300"}`}>
                      <div className="flex items-center gap-2">
                        {testResult.granted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>User Role ({testResult.roleName}): {testResult.message}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-white">
                        {testResult.granted ? "PERMITTED" : "DENIED"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Info size={24} className="mx-auto mb-2 opacity-50" /> Select a role from the left sidebar to edit its permission matrix.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Custom Role */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-400" /> Onboard Custom Application Role
              </h3>
              <button type="button" className="text-slate-400 hover:text-white text-xs" onClick={() => setShowCreateModal(false)}>
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Title / Code:</label>
                <input
                  type="text"
                  placeholder="e.g. BIOMED_SUPERVISOR"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Description:</label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational responsibilities of this role..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  className="authority-btn authority-btn-secondary text-xs"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="authority-btn authority-btn-primary bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  disabled={actionLoading}
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
