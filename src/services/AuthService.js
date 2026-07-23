import API from "./HttpService";

// Register user
export const registerUser = async (data) => {
  const response = await API.post("/api/auth/register", data);
  return response.data;
};

// Login user
export const loginUser = async (data) => {
  const response = await API.post("/api/auth/login", data);
  return response.data;
};

// Request OTP (forgot password)
export const forgotPassword = async (data) => {
  const response = await API.post("/api/auth/forgot-password", data);
  return response.data;
};

// Verify OTP
export const verifyOtp = async (data) => {
  const response = await API.post("/api/auth/verify-otp", data);
  return response.data;
};

// Reset password
export const resetPassword = async (data) => {
  const response = await API.post("/api/auth/reset-password", data);
  return response.data;
};

// Get authority version and permissions for a user
export const getAuthorityVersion = async (userId) => {
  const response = await API.get(`/api/auth/authority/version/${userId}`);
  return response.data;
};

// Increment authority version for a targeted user (Revokes active sessions)
export const incrementAuthorityVersion = async (data) => {
  const response = await API.post("/api/auth/authority/version/increment", data);
  return response.data;
};

// Bump system-wide global authority version
export const bumpGlobalAuthorityVersion = async (data) => {
  const response = await API.post("/api/auth/authority/version/bump-global", data);
  return response.data;
};

// Fetch security audit logs for a user
export const getAuthorityAuditLogs = async (userId) => {
  const response = await API.get(`/api/auth/authority/audit-logs/${userId}`);
  return response.data;
};