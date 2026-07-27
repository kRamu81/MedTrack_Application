import API from "./HttpService";

// Get active security posture policy
export const getActivePolicy = async () => {
  const response = await API.get("/api/auth/posture/policy");
  return response.data;
};

// Update security posture policy parameters
export const updatePolicy = async (data) => {
  const response = await API.put("/api/auth/posture/policy", data);
  return response.data;
};

// Run real-time security posture benchmark evaluation scan
export const runPostureEvaluation = async (data) => {
  const response = await API.post("/api/auth/posture/evaluation/run", data);
  return response.data;
};

// Record posture control check evidence
export const recordPostureCheck = async (data) => {
  const response = await API.post("/api/auth/posture/controls/check", data);
  return response.data;
};

// Get all historical security posture evaluation runs
export const getAllEvaluations = async () => {
  const response = await API.get("/api/auth/posture/evaluations");
  return response.data;
};

// Get all posture control assessment items
export const getAllControlAssessments = async () => {
  const response = await API.get("/api/auth/posture/controls");
  return response.data;
};
