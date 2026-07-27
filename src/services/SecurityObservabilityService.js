import API from "./HttpService";

// Get active security observability policy
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/observability/policy");
  return response.data;
};

// Update security observability policy settings
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/observability/policy", data);
  return response.data;
};

// Ingest real-time security log or event telemetry stream
export const ingestTelemetryStream = async (data) => {
  const response = await API.post("/api/auth/observability/streams/ingest", data);
  return response.data;
};

// Sample a real-time security metric data point
export const recordSecurityMetric = async (data) => {
  const response = await API.post("/api/auth/observability/metrics/record", data);
  return response.data;
};

// Get all active security telemetry streams
export const getAllStreams = async () => {
  const response = await API.get("/api/auth/observability/streams");
  return response.data;
};

// Get all sampled security metric data points
export const getAllMetrics = async () => {
  const response = await API.get("/api/auth/observability/metrics");
  return response.data;
};
