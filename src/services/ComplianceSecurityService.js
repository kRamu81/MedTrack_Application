import API from "./HttpService";

// Get active compliance policy settings
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/compliance/policy");
  return response.data;
};

// Update compliance policy parameters
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/compliance/policy", data);
  return response.data;
};

// Run automated regulatory compliance audit scan
export const runComplianceAudit = async (data) => {
  const response = await API.post("/api/auth/compliance/audit/run", data);
  return response.data;
};

// Record control evidence proof
export const recordControlEvidence = async (data) => {
  const response = await API.post("/api/auth/compliance/controls/evidence", data);
  return response.data;
};

// Get all compliance audit reports
export const getAllAuditReports = async () => {
  const response = await API.get("/api/auth/compliance/reports");
  return response.data;
};

// Get all control evidence items
export const getAllControlItems = async () => {
  const response = await API.get("/api/auth/compliance/controls");
  return response.data;
};
