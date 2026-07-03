import API from "./HttpService";

// Fetch all orders
export const getAllOrders = async () => {
  const response = await API.get("/api/orders");
  return response.data;
};

// Fetch a single order by ID
export const getOrderById = async (id) => {
  const response = await API.get(`/api/orders/${id}`);
  return response.data;
};

// Place a new order
export const placeOrder = async (data) => {
  const response = await API.post("/api/orders", data);
  return response.data;
};

// Update status of an order
export const updateOrderStatus = async (id, status, notes) => {
  const response = await API.put(`/api/orders/${id}?status=${status}&notes=${notes}`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await API.get(`/api/orders/${id}`);
  return response.data;
};
