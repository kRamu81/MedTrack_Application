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
export const updateOrderStatus = async (id, status, notes = "") => {
  const response = await API.put(
    `/api/orders/${id}/status?status=${encodeURIComponent(
      status
    )}&notes=${encodeURIComponent(notes)}`
  );

  return response.data;
};

// Fetch supplier scorecard KPI metrics
export const getSupplierMetrics = async () => {
  const response = await API.get("/api/orders/supplier/metrics");
  return response.data;
};

// Download commercial invoice as PDF blob
export const downloadInvoicePdf = async (id) => {
  const response = await API.get(`/api/orders/${id}/invoice.pdf`, {
    responseType: "blob"
  });
  return response.data;
};

// Email invoice to hospital admin
export const emailInvoice = async (id) => {
  const response = await API.post(`/api/orders/${id}/invoice/email`);
  return response.data;
};
