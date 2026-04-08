import API from "./HttpService";

export const getAllEquipment = async () => {
  const response = await API.get("/api/equipment");
  return response.data;
};

export const addEquipment = async (data) => {
  const response = await API.post("/api/equipment", data);
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await API.delete(`/api/equipment/${id}`);
  return response.data;
};
