import API from "./HttpService";

// Fetch all equipment
export const getAllEquipment = async () => {
  const response = await API.get("/api/equipment");
  return response.data;
};

// Fetch a single equipment item by ID
export const getEquipmentById = async (id) => {
  const response = await API.get(`/api/equipment/${id}`);
  return response.data;
};

// Add new equipment
export const addEquipment = async (data) => {
  const response = await API.post("/api/equipment", data);
  return response.data;
};

// Delete equipment by ID
export const deleteEquipment = async (id) => {
  const response = await API.delete(`/api/equipment/${id}`);
  return response.data;
};

export const getEquipmentById = async (id) => {
  const response = await API.get(`/api/equipment/${id}`);
  return response.data;
};
