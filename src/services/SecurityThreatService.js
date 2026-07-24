import API from "./HttpService";

// Get active threat detection policy
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/threat/policy");
  return response.data;
};

// Update threat policy parameters
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/threat/policy", data);
  return response.data;
};

// Report or ingest a security threat incident
export const reportIncident = async (data) => {
  const response = await API.post("/api/auth/threat/incidents", data);
  return response.data;
};

// Execute SOAR containment action (e.g. IP_BAN, ACCOUNT_LOCKOUT, REVOKE_SESSION)
export const executeContainment = async (data) => {
  const response = await API.post("/api/auth/threat/containment", data);
  return response.data;
};

// Mark incident as resolved
export const resolveIncident = async (incidentId) => {
  const response = await API.post(`/api/auth/threat/incidents/${encodeURIComponent(incidentId)}/resolve`);
  return response.data;
};

// Get all threat incidents
export const getAllIncidents = async () => {
  const response = await API.get("/api/auth/threat/incidents");
  return response.data;
};

// Get all SOAR containment action audit logs
export const getAllContainmentActions = async () => {
  const response = await API.get("/api/auth/threat/containment-actions");
  return response.data;
};
