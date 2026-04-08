import API from "./HttpService";

export const getAllTasks = async (technicianId) => {
  const url = technicianId ? `/api/maintenance?technicianId=${technicianId}` : "/api/maintenance";
  const response = await API.get(url);
  return response.data;
};

export const scheduleTask = async (data) => {
  const response = await API.post("/api/maintenance", data);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await API.put(`/api/maintenance/${id}`, data);
  return response.data;
};
