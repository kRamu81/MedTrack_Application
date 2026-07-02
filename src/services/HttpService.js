import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach the JWT token (saved on login in AuthContext) to every outgoing
// request. Without this, every call to a protected endpoint (equipment,
// orders, maintenance, ...) is rejected with 401 Unauthorized since the
// backend now requires authentication on all routes except login/register.
API.interceptors.request.use((config) => {
  const savedUser = sessionStorage.getItem("medtrack_user");
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;