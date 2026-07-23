import API from "./HttpService";

// Initiate MFA setup (generates TOTP secret and QR URI)
export const setupMfa = async (userId) => {
  const response = await API.post(`/api/auth/mfa/setup/${userId}`);
  return response.data;
};

// Verify 6-digit TOTP code or recovery backup code
export const verifyMfa = async (data) => {
  const response = await API.post("/api/auth/mfa/verify", data);
  return response.data;
};

// Fetch current MFA configuration status
export const getMfaStatus = async (userId) => {
  const response = await API.get(`/api/auth/mfa/status/${userId}`);
  return response.data;
};

// Disable MFA for a user account
export const disableMfa = async (userId) => {
  const response = await API.post(`/api/auth/mfa/disable/${userId}`);
  return response.data;
};

// Fetch active device sessions for a user
export const getActiveDevices = async (userId) => {
  const response = await API.get(`/api/auth/devices/active/${userId}`);
  return response.data;
};

// Register current device session
export const registerDeviceSession = async (userId) => {
  const response = await API.post(`/api/auth/devices/register/${userId}`);
  return response.data;
};

// Revoke a specific device session
export const revokeDeviceSession = async (data) => {
  const response = await API.post("/api/auth/devices/revoke", data);
  return response.data;
};

// Revoke all other active device sessions
export const revokeAllOtherDevices = async (userId, currentDeviceId) => {
  const response = await API.post(`/api/auth/devices/revoke-others/${userId}`, { currentDeviceId });
  return response.data;
};
