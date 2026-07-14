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

// Bulk upload equipment CSV file
export const importEquipmentCsv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post("/api/equipment/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Fetch QR Code for a specific equipment by ID
export const getEquipmentQrCode = async (id) => {
  const response = await API.get(`/api/equipment/${id}/qr-code`);
  return response.data;
};

// Update equipment details by ID
export const updateEquipment = async (id, data) => {
  const response = await API.put(`/api/equipment/${id}`, data);
  return response.data;
};
