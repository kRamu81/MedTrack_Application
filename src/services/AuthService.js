import API from "./HttpService";

export const registerUser = async (data) => {
  const response = await API.post("/api/user/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post("/api/user/login", data);
  return response.data;
};