import API from "./HttpService";

export const getAllOrders = async () => {
  const response = await API.get("/api/orders");
  return response.data;
};

export const placeOrder = async (data) => {
  const response = await API.post("/api/orders", data);
  return response.data;
};

export const updateOrderStatus = async (id, status, notes) => {
  const response = await API.put(`/api/orders/${id}?status=${status}&notes=${notes}`);
  return response.data;
};
