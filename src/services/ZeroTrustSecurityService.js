import API from "./HttpService";

// Get active zero-trust security policy settings
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/zerotrust/policy");
  return response.data;
};

// Update zero-trust policy settings
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/zerotrust/policy", data);
  return response.data;
};

// Evaluate IP address threat score and block status
export const evaluateIpThreat = async (ipAddress, countryCode = "") => {
  const url = `/api/auth/zerotrust/evaluate?ipAddress=${encodeURIComponent(ipAddress)}${countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : ""}`;
  const response = await API.get(url);
  return response.data;
};

// Record a failed authentication attempt for an IP
export const recordFailedAttempt = async (ipAddress) => {
  const response = await API.post(`/api/auth/zerotrust/record-failed?ipAddress=${encodeURIComponent(ipAddress)}`);
  return response.data;
};

// Unblock an IP address
export const unblockIp = async (ipAddress) => {
  const response = await API.post(`/api/auth/zerotrust/unblock?ipAddress=${encodeURIComponent(ipAddress)}`);
  return response.data;
};

// Get all IP threat logs
export const getAllIpThreatLogs = async () => {
  const response = await API.get("/api/auth/zerotrust/threat-logs");
  return response.data;
};

// Get all security policy violations
export const getAllViolations = async () => {
  const response = await API.get("/api/auth/zerotrust/violations");
  return response.data;
};
