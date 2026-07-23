import API from "./HttpService";

// Onboard or update an Enterprise SSO Identity Provider
export const configureSsoProvider = async (data) => {
  const response = await API.post("/api/auth/sso/configure", data);
  return response.data;
};

// Initiate SSO login flow for a corporate email address
export const initiateSsoLogin = async (email) => {
  const response = await API.post("/api/auth/sso/initiate", { email });
  return response.data;
};

// Fetch all configured SSO identity providers
export const getAllSsoProviders = async () => {
  const response = await API.get("/api/auth/sso/providers");
  return response.data;
};

// Toggle provider enabled state
export const toggleSsoProvider = async (providerId, enabled) => {
  const response = await API.post(`/api/auth/sso/toggle/${providerId}?enabled=${enabled}`);
  return response.data;
};

// Evaluate user threat risk analysis score
export const evaluateUserSecurityRisk = async (userId) => {
  const response = await API.get(`/api/auth/audit/risk/${userId}`);
  return response.data;
};

// Fetch user audit session logs
export const getUserAuditLogs = async (userId) => {
  const response = await API.get(`/api/auth/audit/user/${userId}`);
  return response.data;
};
