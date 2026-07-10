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