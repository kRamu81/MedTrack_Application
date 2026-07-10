import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081",
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach the JWT token (saved on login in AuthContext) to every outgoing
// request. Without this, every call to a protected endpoint (equipment,
// orders, maintenance, ...) is rejected with 403 Forbidden since the
// backend now requires authentication on all routes except login/register.
API.interceptors.request.use(
  (config) => {
    const savedUser = sessionStorage.getItem("medtrack_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.token) {
          config.headers["Authorization"] = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error("Failed to parse user details for JWT header injection:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle 403 Forbidden errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      alert("Access Denied: You do not have authorization to perform this action.");
    }
    return Promise.reject(error);
  }
);
export default API;