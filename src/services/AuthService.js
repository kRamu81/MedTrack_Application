import API from "./HttpService";

// Register user
export const registerUser = async (data) => {
  const response = await API.post("/api/user/register", data);
  return response.data;
};

// Login user
export const loginUser = async (data) => {
  const response = await API.post("/api/user/login", data);
  return response.data;
};