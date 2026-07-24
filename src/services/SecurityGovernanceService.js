import API from "./HttpService";

// Get active governance policy settings
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/governance/policy");
  return response.data;
};

// Update governance policy settings
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/governance/policy", data);
  return response.data;
};

// Trigger automated compliance audit scan
export const runComplianceScan = async () => {
  const response = await API.post("/api/auth/governance/scan");
  return response.data;
};

// Get all compliance control rules
export const getAllControls = async () => {
  const response = await API.get("/api/auth/governance/controls");
  return response.data;
};

// Get historical compliance audit reports
export const getAllAuditReports = async () => {
  const response = await API.get("/api/auth/governance/reports");
  return response.data;
};
