import API from "./HttpService";

// Fetch all maintenance tasks, optionally filtered by technician
export const getAllTasks = async (technicianId) => {
  const url = technicianId ? `/api/maintenance?technicianId=${technicianId}` : "/api/maintenance";
  const response = await API.get(url);
  return response.data;
};

// Fetch a single maintenance task by ID
export const getTaskById = async (id) => {
  const response = await API.get(`/api/maintenance/${id}`);
  return response.data;
};

// Schedule a new maintenance task
export const scheduleTask = async (data) => {
  const response = await API.post("/api/maintenance", data);
  return response.data;
};

// Update an existing maintenance task
export const updateTask = async (id, data) => {
  const response = await API.put(`/api/maintenance/${id}`, data);
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await API.get(`/api/maintenance/${id}`);
  return response.data;
};
