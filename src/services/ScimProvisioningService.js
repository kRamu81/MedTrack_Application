import API from "./HttpService";

// Get active SCIM policy settings
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/scim/policy");
  return response.data;
};

// Update SCIM policy parameters
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/scim/policy", data);
  return response.data;
};

// Provision or update federated SCIM user identity
export const provisionScimUser = async (data) => {
  const response = await API.post("/api/auth/scim/users/provision", data);
  return response.data;
};

// Deprovision or suspend federated SCIM identity
export const deprovisionScimUser = async (data) => {
  const response = await API.post("/api/auth/scim/users/deprovision", data);
  return response.data;
};

// Get all mapped SCIM enterprise users
export const getAllUserMappings = async () => {
  const response = await API.get("/api/auth/scim/users");
  return response.data;
};

// Get SCIM provisioning audit logs
export const getAllAuditLogs = async () => {
  const response = await API.get("/api/auth/scim/audit-logs");
  return response.data;
};
