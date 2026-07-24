import API from "./HttpService";

// Get active key vault policy
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/keyvault/policy");
  return response.data;
};

// Update key vault policy
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/keyvault/policy", data);
  return response.data;
};

// Generate new cryptographic key
export const generateCryptoKey = async (data) => {
  const response = await API.post("/api/auth/keyvault/keys", data);
  return response.data;
};

// Rotate existing cryptographic key
export const rotateKey = async (keyId) => {
  const response = await API.post(`/api/auth/keyvault/keys/${encodeURIComponent(keyId)}/rotate`);
  return response.data;
};

// Revoke cryptographic key
export const revokeKey = async (keyId) => {
  const response = await API.post(`/api/auth/keyvault/keys/${encodeURIComponent(keyId)}/revoke`);
  return response.data;
};

// Get all cryptographic key metadata
export const getAllKeys = async () => {
  const response = await API.get("/api/auth/keyvault/keys");
  return response.data;
};

// Get key vault access audit logs
export const getAllAuditLogs = async () => {
  const response = await API.get("/api/auth/keyvault/audit-logs");
  return response.data;
};
